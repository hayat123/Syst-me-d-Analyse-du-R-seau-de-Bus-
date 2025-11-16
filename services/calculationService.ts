
import { GlobalParams, BusLineData, CalendarData, CalculatedData, DailyMetrics, Season, DayType, CalculatedLineData } from '../types';

const getCapacityFromLength = (length: number): number => {
    if (length < 9) return 65;
    if (length < 12) return 85;
    if (length < 18) return 110;
    return 150;
};

const calculateDailyMetrics = (line: BusLineData, params: GlobalParams): Record<Season, Record<DayType, DailyMetrics>> => {
    const dailyMetrics: any = {};
    const seasons: Season[] = ['Hiver', 'Ete', 'Ramadan'];
    const dayTypes: DayType[] = ['LaV', 'S', 'DF'];

    for (const season of seasons) {
        dailyMetrics[season] = {};
        for (const dayType of dayTypes) {
            const schedule = line.schedules[season][dayType];
            if (!schedule) continue;

            // 1. Temps de Cycle et Flotte
            const tc = schedule.time_aller_min + schedule.time_retour_min + params.ttd;
            const bus_peak = Math.ceil(tc / (schedule.frequency_peak_min || 15));
            const bus_offpeak = Math.ceil(tc / (schedule.frequency_offpeak_min || 15));
            const bus_max = Math.max(bus_peak, bus_offpeak, 1);
            const parc_affecte = Math.ceil(bus_max * (1 + params.gamma));

            // 2. Expéditions
            const service_duration_min = (schedule.service_end_h - schedule.service_start_h) * 60;
            let peak_duration_min = 0;
            schedule.peak_periods.forEach(p => {
                peak_duration_min += (p.end_h - p.start_h) * 60;
            });
            const offpeak_duration_min = service_duration_min - peak_duration_min;

            const trips_peak = peak_duration_min > 0 ? peak_duration_min / schedule.frequency_peak_min : 0;
            const trips_offpeak = offpeak_duration_min > 0 ? offpeak_duration_min / schedule.frequency_offpeak_min : 0;
            const trips_ab = trips_peak + trips_offpeak;
            const trips_total = trips_ab * 2;

            // 3. Kilomètres
            const km_com = 2 * line.length_km * trips_ab;
            const delta = (line.dist_origin_depot_km + line.dist_destination_depot_km) / 2;
            const km_hlp = delta * (2 * bus_max);
            const km_tech = km_com * (params.r_fmds + params.r_acc);
            const km_total = km_com + km_hlp + km_tech;

            // 4. Heures
            const h_charge = (schedule.time_aller_min * trips_ab + schedule.time_retour_min * trips_ab) / 60;
            const h_hlp = km_hlp / params.v_hlp;
            const h_tech = km_tech / params.v_tech;
            const h_total = h_charge + h_hlp + h_tech;
            const h_payees = h_total * params.alpha;

            // 5. Conducteurs
            const etp = h_payees / params.h_poste;
            const etp_res = etp * (1 + params.beta);

            // 6. Capacité
            const capacity = getCapacityFromLength(line.bus_length_m);
            const o_pointe = 60 / schedule.frequency_peak_min;
            const pphpd = capacity * o_pointe;

            dailyMetrics[season][dayType] = {
                tc, bus_max, parc_affecte, trips_ab, trips_total, km_com, km_hlp, km_tech,
                km_total, h_charge, h_hlp, h_tech, h_total, h_payees, etp, etp_res, pphpd,
                h_conducteurs: h_payees,
            };
        }
    }
    return dailyMetrics;
};

export const calculateAllMetrics = (lines: BusLineData[], params: GlobalParams, calendar: CalendarData): CalculatedData => {
    const calculatedLines: CalculatedLineData[] = lines.map(line => {
        const daily = calculateDailyMetrics(line, params);
        const annual_forecast: Record<number, any> = {};
        const tenYearTotals = { parc_affecte: 0, voyages: 0, km_com: 0, km_hlp: 0, km_tech: 0, km_total: 0, h_commercial: 0, h_technique: 0, h_total: 0 };
        
        let max_parc_affecte_an = 0;

        for (const yearStr in calendar) {
            const year = parseInt(yearStr);
            const yearData = calendar[year];
            let total_voyages_an = 0, total_km_com_an = 0, total_km_hlp_an = 0, total_km_tech_an = 0;
            let total_h_commercial_an = 0, total_h_technique_an = 0;
            let max_parc_this_year = 0;

            for (const season of (['Hiver', 'Ete', 'Ramadan'] as Season[])) {
                for (const dayType of (['LaV', 'S', 'DF'] as DayType[])) {
                    const num_days = yearData[season]?.[dayType] || 0;
                    const metrics = daily[season]?.[dayType];
                    if (num_days > 0 && metrics) {
                        total_voyages_an += metrics.trips_total * num_days;
                        total_km_com_an += metrics.km_com * num_days;
                        total_km_hlp_an += metrics.km_hlp * num_days;
                        total_km_tech_an += metrics.km_tech * num_days;
                        total_h_commercial_an += metrics.h_charge * num_days;
                        total_h_technique_an += (metrics.h_hlp + metrics.h_tech) * num_days;
                        if (metrics.parc_affecte > max_parc_this_year) {
                            max_parc_this_year = metrics.parc_affecte;
                        }
                    }
                }
            }
            
            annual_forecast[year] = {
                parc_affecte_an: max_parc_this_year,
                voyages_an: total_voyages_an,
                km_com_an: total_km_com_an,
                km_hlp_an: total_km_hlp_an,
                km_tech_an: total_km_tech_an,
                km_total_an: total_km_com_an + total_km_hlp_an + total_km_tech_an,
                h_commercial_an: total_h_commercial_an,
                h_technique_an: total_h_technique_an,
                h_total_an: total_h_commercial_an + total_h_technique_an
            };
            if(max_parc_this_year > max_parc_affecte_an) max_parc_affecte_an = max_parc_this_year;
            tenYearTotals.voyages += total_voyages_an;
            tenYearTotals.km_com += total_km_com_an;
            tenYearTotals.km_hlp += total_km_hlp_an;
            tenYearTotals.km_tech += total_km_tech_an;
            tenYearTotals.km_total += (total_km_com_an + total_km_hlp_an + total_km_tech_an);
            tenYearTotals.h_commercial += total_h_commercial_an;
            tenYearTotals.h_technique += total_h_technique_an;
            tenYearTotals.h_total += (total_h_commercial_an + total_h_technique_an);
        }

        const numYears = Object.keys(calendar).length;
        const ten_year_avg = {
            parc_affecte: max_parc_affecte_an,
            voyages: tenYearTotals.voyages / numYears,
            km_com: tenYearTotals.km_com / numYears,
            km_hlp: tenYearTotals.km_hlp / numYears,
            km_tech: tenYearTotals.km_tech / numYears,
            km_total: tenYearTotals.km_total / numYears,
            h_commercial: tenYearTotals.h_commercial / numYears,
            h_technique: tenYearTotals.h_technique / numYears,
            h_total: tenYearTotals.h_total / numYears,
        };

        const depot_proche = line.dist_origin_depot_km < line.dist_destination_depot_km
            ? { location: 'Origine', distance: line.dist_origin_depot_km }
            : { location: 'Destination', distance: line.dist_destination_depot_km };
        
        return {
            ...line,
            capacity: getCapacityFromLength(line.bus_length_m),
            depot_proche,
            daily,
            annual_forecast,
            ten_year_avg
        };
    });

    const network_totals = calculatedLines.reduce((totals, line) => {
        totals.total_fleet += line.ten_year_avg.parc_affecte;
        totals.total_voyages_an += line.ten_year_avg.voyages;
        totals.total_km_an += line.ten_year_avg.km_total;
        totals.total_heures_conduite_an += line.ten_year_avg.h_total * params.alpha; // H_payees
        return totals;
    }, { total_fleet: 0, total_voyages_an: 0, total_km_an: 0, total_heures_conduite_an: 0 });

    return { lines: calculatedLines, network_totals };
};
