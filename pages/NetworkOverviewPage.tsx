import React, { useContext, useState, useMemo, useRef } from 'react';
import { DataContext } from '../App';
import { BusLineData, Schedule } from '../types';

declare const JSZip: any;

interface Props {
    onSelectLine: (lineId: string) => void;
}

// Helper function to map the imported JSON structure to the internal BusLineData structure.
const mapImportedJsonToBusLineData = (rawData: any): BusLineData => {
    // Helper to parse time string "HH:MM" to a number of hours.
    const parseTime = (timeStr?: string): number => {
        if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + (minutes || 0) / 60;
    };

    // Helper to parse peak period strings like "07:00-09:00".
    const parsePeakPeriods = (peakData: any, seasonKey: 'Hiver' | 'Été' | 'Ramadan'): { start_h: number; end_h: number }[] => {
        const seasonPeriods = peakData?.[seasonKey];
        if (!seasonPeriods) return [];
        
        const periods: { start_h: number; end_h: number }[] = [];
        
        if (seasonPeriods.matin && typeof seasonPeriods.matin === 'string') {
            const [start, end] = seasonPeriods.matin.split('-');
            periods.push({ start_h: parseTime(start), end_h: parseTime(end) });
        }
        if (seasonPeriods.soir && typeof seasonPeriods.soir === 'string') {
            const [start, end] = seasonPeriods.soir.split('-');
            periods.push({ start_h: parseTime(start), end_h: parseTime(end) });
        }
        return periods;
    };

    // FIX: Cast to any to allow dynamic population of the schedules object.
    const schedules: BusLineData['schedules'] = { Hiver: {} as any, Ete: {} as any, Ramadan: {} as any };
    
    const seasonMap: Record<string, 'Hiver' | 'Ete' | 'Ramadan'> = { 'Hiver': 'Hiver', 'Été': 'Ete', 'Ramadan': 'Ramadan' };
    const dayTypeMap: Record<string, 'LaV' | 'S' | 'DF'> = { 'L-V': 'LaV', 'S': 'S', 'DF': 'DF' };
    
    const keys = Object.keys(rawData.heures_ouverture || {});

    for (const key of keys) {
        const [dayStr, seasonStr] = key.split('_');
        const season = seasonMap[seasonStr];
        const dayType = dayTypeMap[dayStr];

        if (!season || !dayType) continue;

        const hoursData = rawData.heures_ouverture[key];
        const intervalData = rawData.intervalles_min[key];
        
        if (!hoursData || !intervalData) continue;
        
        // Estimate travel time as it's missing. Using default commercial speed of 18 km/h.
        const estimatedTravelTime = Math.round((rawData.longueur_km / 18) * 60);

        schedules[season][dayType] = {
            service_start_h: parseTime(hoursData.debut_service),
            service_end_h: parseTime(hoursData.fin_service),
            time_aller_min: estimatedTravelTime,
            time_retour_min: estimatedTravelTime,
            peak_periods: parsePeakPeriods(rawData.periodes_pointe, seasonStr as 'Hiver' | 'Été' | 'Ramadan'),
            frequency_peak_min: intervalData.pointe || 15,
            frequency_offpeak_min: intervalData.vallee || 30,
        };
    }
    
    const mappedLine: BusLineData = {
        id: rawData.id,
        name: rawData.nom,
        category: rawData.categorie || 'N/A',
        origin: rawData.origine || 'N/A',
        destination: rawData.destination || 'N/A',
        length_km: rawData.longueur_km,
        bus_length_m: 12.0, // Default value
        dist_origin_depot_km: 5.0, // Default value
        dist_destination_depot_km: 10.0, // Default value
        schedules: schedules,
    };
    
    if (!mappedLine.id || !mappedLine.name || Object.keys(mappedLine.schedules).length === 0) {
        throw new Error(`Le fichier JSON pour la ligne ${rawData.id || '(ID inconnu)'} est mal formé ou incomplet.`);
    }

    return mappedLine;
};


const NetworkOverviewPage: React.FC<Props> = ({ onSelectLine }) => {
    const context = useContext(DataContext);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterOrigin, setFilterOrigin] = useState('');
    const [filterDestination, setFilterDestination] = useState('');

    if (!context || !context.calculatedData) return <div>Chargement...</div>;
    const { lines } = context.calculatedData;
    const { setLines } = context;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result;
                if (!(arrayBuffer instanceof ArrayBuffer)) {
                    throw new Error("Erreur de lecture du fichier.");
                }

                const zip = await JSZip.loadAsync(arrayBuffer);
                const jsonFilePromises: Promise<any[]>[] = [];

                zip.forEach((relativePath: string, file: any) => {
                    if (!file.dir && relativePath.toLowerCase().endsWith('.json')) {
                        const jsonPromise = file.async('string').then((content: string) => {
                            const data = JSON.parse(content);
                            return Array.isArray(data) ? data : [data];
                        });
                        jsonFilePromises.push(jsonPromise);
                    }
                });

                if (jsonFilePromises.length === 0) {
                    throw new Error("Aucun fichier .json trouvé dans l'archive ZIP.");
                }

                const rawDataArrays = await Promise.all(jsonFilePromises);
                const rawLines = rawDataArrays.flat();

                if (rawLines.length === 0) {
                    throw new Error("Aucune donnée de ligne de bus trouvée dans les fichiers JSON.");
                }

                const newLines = rawLines.map((rawLine, index) => {
                    try {
                        return mapImportedJsonToBusLineData(rawLine);
                    } catch (mappingError) {
                        const message = mappingError instanceof Error ? mappingError.message : 'Erreur inconnue';
                        throw new Error(`Erreur de formatage pour la ligne à l'index ${index} (${rawLine.id || 'ID inconnu'}): ${message}`);
                    }
                });

                setLines(newLines);
                alert(`${newLines.length} lignes importées avec succès ! Le réseau va maintenant être mis à jour.`);

            } catch (error) {
                console.error("Erreur d'importation du ZIP:", error);
                alert(`Erreur d'importation du ZIP:\n${error instanceof Error ? error.message : 'Erreur inconnue'}`);
            }
        };
        reader.onerror = () => {
            alert("Erreur de lecture du fichier.");
        };
        
        reader.readAsArrayBuffer(file);
        event.target.value = '';
    };

    const uniqueCategories = useMemo(() => [...new Set(lines.map(line => line.category))].sort(), [lines]);
    const uniqueOrigins = useMemo(() => [...new Set(lines.map(line => line.origin))].sort(), [lines]);
    const uniqueDestinations = useMemo(() => [...new Set(lines.map(line => line.destination))].sort(), [lines]);

    const filteredLines = useMemo(() => {
        return lines.filter(line => 
            (filterCategory === '' || line.category === filterCategory) &&
            (filterOrigin === '' || line.origin === filterOrigin) &&
            (filterDestination === '' || line.destination === filterDestination)
        );
    }, [lines, filterCategory, filterOrigin, filterDestination]);

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-3xl font-bold text-gray-800">Vue d'ensemble des Lignes de Bus</h2>
                <p className="text-gray-500 mt-1">Total de {lines.length} lignes</p>
            </header>

            <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <select onChange={e => setFilterCategory(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 md:col-span-1">
                        <option value="">Toutes les catégories</option>
                        {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select onChange={e => setFilterOrigin(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 md:col-span-1">
                        <option value="">Toutes les origines</option>
                        {uniqueOrigins.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select onChange={e => setFilterDestination(e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 md:col-span-1">
                        <option value="">Toutes les destinations</option>
                        {uniqueDestinations.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button onClick={handleImportClick} className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors md:col-span-1">
                        Importer un ZIP de Lignes (.zip)
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".zip"
                        className="hidden"
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Toutes les Lignes de Bus</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['ID Ligne', 'Nom', 'Catégorie', 'Origine', 'Destination', 'Longueur (km)', 'Action'].map(header => (
                                    <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLines.map(line => (
                                <tr key={line.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{line.id}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{line.name}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{line.category}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{line.origin}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{line.destination}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{line.length_km.toFixed(1)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <button onClick={() => onSelectLine(line.id)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors">
                                            Analyser
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NetworkOverviewPage;