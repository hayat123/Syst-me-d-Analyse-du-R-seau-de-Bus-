
import React from 'react';
import { CalculatedLineData, Season, DayType } from '../types';
import Icon from '../components/Icon';

interface Props {
    lineData: CalculatedLineData;
}

const nf = (n: number, dp = 0) => n.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });

const LineAnalysisPage: React.FC<Props> = ({ lineData }) => {
    const avg = lineData.ten_year_avg;
    
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center space-x-2 text-gray-500">
                    <span>Lignes</span>
                    <span>/</span>
                    <span className="font-semibold text-blue-600">A01</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mt-1">Ligne {lineData.id} - {lineData.name}</h2>
            </div>

            {/* Informations */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Informations de la Ligne</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div><p className="text-gray-500">Origine</p><p className="font-medium">{lineData.origin}</p></div>
                    <div><p className="text-gray-500">Destination</p><p className="font-medium">{lineData.destination}</p></div>
                    <div><p className="text-gray-500">Longueur</p><p className="font-medium">{lineData.length_km} km</p></div>
                    <div><p className="text-gray-500">Catégorie</p><p className="font-medium">{lineData.category}</p></div>
                    <div className="col-span-2 md:col-span-4 flex items-center bg-blue-50 p-3 rounded-md">
                        <Icon name="pin" className="w-5 h-5 text-blue-500 mr-3"/>
                        <p>Localisation Proche Dépôt: <span className="font-semibold">{lineData.depot_proche.location}</span> (Distance: {lineData.depot_proche.distance} km)</p>
                    </div>
                </div>
            </div>

             {/* Paramètres & Résumé */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Paramètres de la Ligne</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Longueur du Bus (mètres)</span> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{lineData.bus_length_m.toFixed(1)}m</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Capacité du Bus (calculée)</span> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{lineData.capacity} passagers</span></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                     <h3 className="text-xl font-semibold mb-4">Résumé des Métriques Annuelles (Moyenne sur 10 ans)</h3>
                     <div className="grid grid-cols-3 gap-4 text-center">
                        <div><p className="text-sm text-gray-500">PARC AFFECTÉ</p><p className="text-2xl font-bold text-blue-600">{avg.parc_affecte}</p></div>
                        <div><p className="text-sm text-gray-500">VOYAGES/AN</p><p className="text-2xl font-bold text-green-600">{nf(avg.voyages)}</p></div>
                        <div><p className="text-sm text-gray-500">KM TOTAL/AN</p><p className="text-2xl font-bold text-amber-600">{nf(avg.km_total)}</p></div>
                     </div>
                </div>
             </div>

            {/* Detail Année */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Détail Année par Année (2026-2035)</h3>
                <div className="overflow-x-auto text-sm">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Année', 'Parc', 'Voyages', 'Km Com', 'Km HLP', 'Km Tech', 'Km Total', 'Heures Commercial', 'Heures Technique', 'Heures Total'].map(h => (
                                    <th key={h} className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {Object.entries(lineData.annual_forecast).map(([year, data]) => (
                                <tr key={year}>
                                    <td className="px-3 py-2 font-medium text-gray-800 text-right">{year}</td>
                                    <td className="px-3 py-2 text-right">{data.parc_affecte_an}</td>
                                    <td className="px-3 py-2 text-right">{nf(data.voyages_an)}</td>
                                    <td className="px-3 py-2 text-right">{nf(data.km_com_an)}</td>
                                    <td className="px-3 py-2 text-right">{nf(data.km_hlp_an)}</td>
                                    <td className="px-3 py-2 text-right">{nf(data.km_tech_an)}</td>
                                    <td className="px-3 py-2 text-right font-semibold">{nf(data.km_total_an)}</td>
                                    <td className="px-3 py-2 text-right">{nf(data.h_commercial_an)}</td>
                                    <td className="px-3 py-2 text-right">{nf(data.h_technique_an)}</td>
                                    <td className="px-3 py-2 text-right font-semibold">{nf(data.h_total_an)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Daily Metrics */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                 <h3 className="text-xl font-semibold mb-4">Métriques Opérationnelles Quotidiennes par Saison et Type de Jour</h3>
                 <div className="overflow-x-auto text-sm">
                    <table className="min-w-full">
                         <thead className="bg-gray-50">
                            <tr>
                                {['Période', 'Bus', 'Voyages', 'Km Com', 'Km HLP', 'Km Tech', 'Km Total', 'H. Commercial', 'H. Conduite', 'PPHPD'].map(h => (
                                    <th key={h} className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {Object.entries(lineData.daily).flatMap(([season, dayTypes]) => 
                            Object.entries(dayTypes).map(([dayType, metrics]) => (
                                <tr key={`${season}-${dayType}`}>
                                    <td className="px-3 py-2 font-medium text-gray-800 text-right">{season} {dayType}</td>
                                    <td className="px-3 py-2 text-right">{metrics.bus_max}</td>
                                    <td className="px-3 py-2 text-right">{nf(metrics.trips_total)}</td>
                                    <td className="px-3 py-2 text-right">{nf(metrics.km_com, 1)}</td>
                                    <td className="px-3 py-2 text-right">{nf(metrics.km_hlp, 1)}</td>
                                    <td className="px-3 py-2 text-right">{nf(metrics.km_tech, 1)}</td>
                                    <td className="px-3 py-2 text-right font-semibold">{nf(metrics.km_total, 1)}</td>
                                    <td className="px-3 py-2 text-right">{nf(metrics.h_charge, 2)}</td>
                                    <td className="px-3 py-2 text-right">{nf(metrics.h_total, 2)}</td>
                                    <td className="px-3 py-2 text-right">{nf(metrics.pphpd)}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                 </div>
            </div>

        </div>
    );
};

export default LineAnalysisPage;
