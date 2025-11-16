import React, { useContext } from 'react';
import { DataContext } from '../App';
import Card from '../components/Card';
import Icon from '../components/Icon';
import { View } from '../types';

interface Props {
    onSelectLine: (lineId: string) => void;
    setView: (view: View) => void;
}

const GlobalSummaryPage: React.FC<Props> = ({ onSelectLine, setView }) => {
    const context = useContext(DataContext);
    if (!context || !context.calculatedData) return <div>Chargement...</div>;

    const { lines, network_totals } = context.calculatedData;
    const { params } = context;

    if (lines.length === 0) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
                <div className="text-center p-12 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
                    <svg className="mx-auto h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h2 className="mt-6 text-3xl font-bold text-gray-800">Bienvenue dans l'Analyseur de Réseau de Bus</h2>
                    <p className="mt-4 text-gray-600">
                        Le système est prêt, mais aucune donnée de ligne n'a été chargée.
                        Pour commencer, veuillez importer les données de votre réseau via un fichier ZIP.
                    </p>
                    <button
                        onClick={() => setView('overview')}
                        className="mt-8 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 inline-flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Importer les Lignes (ZIP)
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Résumé Global du Réseau</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card 
                    title="Flotte Allouée / Disponible" 
                    value={`${network_totals.total_fleet.toLocaleString()} / ${params.totalBusesAvailable.toLocaleString()}`} 
                    icon={<Icon name="bus" />} 
                    color="#3B82F6" 
                />
                <Card title="Voyages Annuels" value={Math.round(network_totals.total_voyages_an).toLocaleString()} icon={<Icon name="trips" />} color="#10B981" />
                <Card title="Kilomètres Annuels" value={Math.round(network_totals.total_km_an).toLocaleString()} icon={<Icon name="road" />} color="#F59E0B" />
                <Card title="Heures de Conduite/An" value={Math.round(network_totals.total_heures_conduite_an).toLocaleString()} icon={<Icon name="clock" />} color="#EF4444" />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Résumé Ligne par Ligne</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Ligne</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Longueur (km)</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Parc</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Voyages Annuels</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Km Annuels</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Heures de Conduite/An</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {lines.map((line) => (
                                <tr key={line.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectLine(line.id)}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{line.id}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{line.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{line.length_km.toFixed(1)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{line.ten_year_avg.parc_affecte}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{Math.round(line.ten_year_avg.voyages).toLocaleString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{Math.round(line.ten_year_avg.km_total).toLocaleString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{Math.round(line.ten_year_avg.h_total).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GlobalSummaryPage;