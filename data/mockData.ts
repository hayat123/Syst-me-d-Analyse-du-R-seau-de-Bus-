
import { GlobalParams, BusLineData, CalendarData } from '../types';

export const initialParameters: GlobalParams = {
  ttd: 10,
  v_hlp: 25,
  v_tech: 20,
  v_commercial: 18,
  r_fmds: 0.05,
  r_acc: 0.01,
  alpha: 1.1,
  beta: 0.12,
  gamma: 0.12,
  h_poste: 7.5,
};

const defaultSchedule = {
    service_start_h: 6,
    service_end_h: 23,
    time_aller_min: 29,
    time_retour_min: 29,
    peak_periods: [{ start_h: 7, end_h: 9 }, { start_h: 17, end_h: 19 }],
    frequency_peak_min: 15,
    frequency_offpeak_min: 25,
};

const ramadanSchedule = {
  ...defaultSchedule,
  peak_periods: [{ start_h: 7, end_h: 9 }, { start_h: 16, end_h: 18 }, { start_h: 21, end_h: 23 }],
};

export const mockBusLines: BusLineData[] = [
  {
    id: 'A01',
    name: 'Aéroport – Jamâa El Fna',
    category: 'Ligne spéciale (A)',
    origin: 'Aéroport',
    destination: 'Jamâa el Fna',
    length_km: 8.7,
    bus_length_m: 12.0,
    dist_origin_depot_km: 8.5,
    dist_destination_depot_km: 11.2,
    schedules: {
        Hiver: { LaV: defaultSchedule, S: {...defaultSchedule, frequency_peak_min: 20, frequency_offpeak_min: 30}, DF: {...defaultSchedule, frequency_peak_min: 25, frequency_offpeak_min: 35} },
        Ete: { LaV: defaultSchedule, S: {...defaultSchedule, frequency_peak_min: 18, frequency_offpeak_min: 28}, DF: {...defaultSchedule, frequency_peak_min: 22, frequency_offpeak_min: 32} },
        Ramadan: { LaV: ramadanSchedule, S: {...ramadanSchedule, frequency_peak_min: 20, frequency_offpeak_min: 30}, DF: {...ramadanSchedule, frequency_peak_min: 25, frequency_offpeak_min: 35} },
    },
  },
  {
    id: 'B02',
    name: 'Gare Routière Al Azzouzia - Douar Dlam',
    category: 'Ligne Basique (B)',
    origin: 'Gare Routière Al Azzouzia',
    destination: 'Douar Dlam',
    length_km: 21.3,
    bus_length_m: 12.0,
    dist_origin_depot_km: 5,
    dist_destination_depot_km: 15,
    schedules: {
        Hiver: { LaV: {...defaultSchedule, time_aller_min: 45, time_retour_min: 45}, S: {...defaultSchedule, time_aller_min: 45, time_retour_min: 45, frequency_peak_min: 20, frequency_offpeak_min: 30}, DF: {...defaultSchedule, time_aller_min: 45, time_retour_min: 45, frequency_peak_min: 25, frequency_offpeak_min: 35} },
        Ete: { LaV: {...defaultSchedule, time_aller_min: 45, time_retour_min: 45}, S: {...defaultSchedule, time_aller_min: 45, time_retour_min: 45, frequency_peak_min: 18, frequency_offpeak_min: 28}, DF: {...defaultSchedule, time_aller_min: 45, time_retour_min: 45, frequency_peak_min: 22, frequency_offpeak_min: 32} },
        Ramadan: { LaV: {...ramadanSchedule, time_aller_min: 45, time_retour_min: 45}, S: {...ramadanSchedule, time_aller_min: 45, time_retour_min: 45, frequency_peak_min: 20, frequency_offpeak_min: 30}, DF: {...ramadanSchedule, time_aller_min: 45, time_retour_min: 45, frequency_peak_min: 25, frequency_offpeak_min: 35} },
    },
  },
  // Add more lines to reach 67 if needed for full simulation, but 2 is enough for demo
];

export const mockCalendar: CalendarData = {};
for (let year = 2026; year <= 2035; year++) {
  mockCalendar[year] = {
    Hiver: { LaV: 160, S: 40, DF: 42 },
    Ete: { LaV: 65, S: 20, DF: 22 },
    Ramadan: { LaV: 20, S: 5, DF: 5 },
  };
}
