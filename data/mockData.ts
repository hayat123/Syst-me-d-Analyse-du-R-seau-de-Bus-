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
  c: 85,
  totalBusesAvailable: 349,
  alpha_duty: 1.05,
  w: 1.1667,
};

// L'application démarre désormais avec un état vide et attend l'importation par l'utilisateur.
// Les données de démonstration sont supprimées pour garantir que tous les calculs 
// sont basés sur le fichier ZIP fourni.
export const mockBusLines: BusLineData[] = [];


export const mockCalendar: CalendarData = {};
for (let year = 2026; year <= 2035; year++) {
  mockCalendar[year] = {
    Hiver: { LaV: 160, S: 40, DF: 42 },
    Ete: { LaV: 65, S: 20, DF: 22 },
    Ramadan: { LaV: 20, S: 5, DF: 5 },
  };
}