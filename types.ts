
export type View = 'summary' | 'overview' | 'line-detail' | 'params';
export type Season = 'Hiver' | 'Ete' | 'Ramadan';
export type DayType = 'LaV' | 'S' | 'DF';

export interface GlobalParams {
  ttd: number;
  v_hlp: number;
  v_tech: number;
  v_commercial: number;
  r_fmds: number;
  r_acc: number;
  alpha: number;
  beta: number;
  gamma: number;
  h_poste: number;
}

export interface Schedule {
  service_start_h: number;
  service_end_h: number;
  time_aller_min: number;
  time_retour_min: number;
  peak_periods: { start_h: number; end_h: number }[];
  frequency_peak_min: number;
  frequency_offpeak_min: number;
}

export interface BusLineData {
  id: string;
  name: string;
  category: string;
  origin: string;
  destination: string;
  length_km: number;
  bus_length_m: number;
  dist_origin_depot_km: number;
  dist_destination_depot_km: number;
  schedules: Record<Season, Record<DayType, Schedule>>;
}

export type CalendarData = Record<number, Record<Season, Record<DayType, number>>>;

// Calculated Metrics
export interface DailyMetrics {
  tc: number;
  bus_max: number;
  parc_affecte: number;
  trips_ab: number;
  trips_total: number;
  km_com: number;
  km_hlp: number;
  km_tech: number;
  km_total: number;
  h_charge: number;
  h_hlp: number;
  h_tech: number;
  h_total: number;
  h_payees: number;
  etp: number;
  etp_res: number;
  pphpd: number;
  h_conducteurs: number; // For crew planning
}

export interface CalculatedDailyMetrics {
  [season: string]: {
    [dayType: string]: DailyMetrics;
  };
}

export interface AnnualMetrics {
    parc_affecte_an: number;
    voyages_an: number;
    km_com_an: number;
    km_hlp_an: number;
    km_tech_an: number;
    km_total_an: number;
    h_commercial_an: number;
    h_technique_an: number;
    h_total_an: number;
}

export interface TenYearAverages {
    parc_affecte: number;
    voyages: number;
    km_com: number;
    km_hlp: number;
    km_tech: number;
    km_total: number;
    h_commercial: number;
    h_technique: number;
    h_total: number;
}

export interface CalculatedLineData extends BusLineData {
    capacity: number;
    depot_proche: { location: string, distance: number };
    daily: CalculatedDailyMetrics;
    annual_forecast: Record<number, AnnualMetrics>;
    ten_year_avg: TenYearAverages;
}

export interface NetworkTotals {
    total_fleet: number;
    total_voyages_an: number;
    total_km_an: number;
    total_heures_conduite_an: number;
}

export interface CalculatedData {
    lines: CalculatedLineData[];
    network_totals: NetworkTotals;
}
