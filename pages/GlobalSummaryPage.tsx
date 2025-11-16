
import React, { useContext } from 'react';
import { DataContext } from '../App';
import Card from '../components/Card';
import Icon from '../components/Icon';

interface Props {
    onSelectLine: (lineId: string) => void;
}

const GlobalSummaryPage: React.FC<Props> = ({ onSelectLine }) => {
    const context = useContext(DataContext);
    if (!context || !context.calculatedData) return <div>Chargement...</div>;

    const { lines, network_totals } = context.calculatedData;

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Résumé Global du Réseau</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Allocation de la Flotte" value={network_totals.total_fleet.toLocaleString()} icon={<Icon name="bus" />} color="#3B82F6" />
                <Card title="Voyages Annuels" value={Math.round(network_totals.total_voyages_an).toLocaleString()} icon={<Icon name="trips" />} color="#10B981" />
                <Card title="Kilomètres Annuels" value={Math.round(network_totals.total_km_an).toLocaleString()} icon={<Icon name="road" />} color="#F59E0B" />
                <Card title="Heures Annuelles" value={Math.round(network_totals.total_heures_conduite_an).toLocaleString()} icon={<Icon name="clock" />} color="#EF4444" />
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
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{Math.round(line.ten_year_avg.h_total * context.params.alpha).toLocaleString()}</td>
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
