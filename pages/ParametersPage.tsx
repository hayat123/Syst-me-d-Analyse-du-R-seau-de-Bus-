
import React, { useContext, useState } from 'react';
import { DataContext } from '../App';
import { GlobalParams } from '../types';

const ParameterInput: React.FC<{
    label: string;
    description: string;
    unit: string;
    value: number;
    name: keyof GlobalParams;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, description, unit, value, name, onChange }) => (
    <div className="grid grid-cols-12 gap-4 items-center py-3 border-b">
        <div className="col-span-2"><label className="font-mono text-sm font-medium text-gray-700">{label}</label></div>
        <div className="col-span-5"><p className="text-sm text-gray-500">{description}</p></div>
        <div className="col-span-3"><input type="number" step="0.01" name={name} value={value} onChange={onChange} className="w-full p-2 border rounded-md text-right"/></div>
        <div className="col-span-2"><span className="text-sm text-gray-500">{unit}</span></div>
    </div>
);

const ParametersPage: React.FC = () => {
    const context = useContext(DataContext);
    
    if (!context) return <div>Chargement...</div>;
    const { params, setParams } = context;

    const [localParams, setLocalParams] = useState<GlobalParams>(params);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalParams(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    const handleSave = () => {
        setParams(localParams);
        alert('Paramètres sauvegardés!');
    };

    const handleReset = () => {
        setLocalParams(params);
    };

    const paramConfig = [
        { name: 'ttd', label: 'Tt+Td', description: 'Temps de retournement total', unit: 'minutes' },
        { name: 'v_hlp', label: 'v_hlp', description: 'Vitesse hors ligne passagers', unit: 'km/h' },
        { name: 'v_tech', label: 'v_tech', description: 'Vitesse technique', unit: 'km/h' },
        { name: 'v_commercial', label: 'v_commercial', description: 'Vitesse commerciale', unit: 'km/h' },
        { name: 'r_fmds', label: 'r_FMDS', description: 'Ratio technique maintenance', unit: 'ratio' },
        { name: 'r_acc', label: 'r_ACC', description: 'Ratio accidentologie', unit: 'ratio' },
        { name: 'alpha', label: 'α (alpha)', description: 'Multiplicateur heures payées', unit: 'ratio' },
        { name: 'beta', label: 'β (beta)', description: 'Réserve conducteurs', unit: 'ratio' },
        { name: 'gamma', label: 'γ (gamma)', description: 'Ratio véhicules de réserve', unit: 'ratio' },
        { name: 'h_poste', label: 'h_poste', description: 'Durée du poste conducteur', unit: 'heures' },
        { name: 'c', label: 'C', description: 'Capacité par bus', unit: 'passagers' },
        { name: 'totalBusesAvailable', label: 'Flotte dispo.', description: 'Total de bus disponibles dans la flotte', unit: 'bus' },
        { name: 'alpha_duty', label: 'α_duty', description: 'Facteur inefficience relèves/positionnement', unit: 'ratio' },
        { name: 'w', label: 'W', description: 'Facteur repos hebdomadaire (7/6)', unit: 'ratio' },
    ];

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Paramètres de Calcul</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <h3 className="text-xl font-semibold">Modifier les Paramètres</h3>
                    <div className="space-x-2">
                        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Sauvegarder</button>
                        <button onClick={handleReset} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition">Réinitialiser</button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-4 items-center py-2 text-xs font-bold text-gray-500 uppercase">
                    <div className="col-span-2">Paramètre</div>
                    <div className="col-span-5">Description</div>
                    <div className="col-span-3 text-center">Valeur</div>
                    <div className="col-span-2">Unité</div>
                </div>
                
                {paramConfig.map(p => (
                     <ParameterInput 
                        key={p.name} 
                        label={p.label} 
                        description={p.description} 
                        unit={p.unit} 
                        value={localParams[p.name as keyof GlobalParams]}
                        name={p.name as keyof GlobalParams}
                        onChange={handleChange}
                    />
                ))}

                 <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-sm text-yellow-800">
                        <span className="font-bold">Attention :</span> Ces paramètres sont utilisés dans tous les calculs du réseau. La modification de ces valeurs affectera immédiatement toutes les métriques calculées sur l'ensemble du réseau.
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Formules Principales</h3>
                <div className="space-y-2 text-sm font-mono bg-gray-800 text-white p-6 rounded-md">
                   <p className="font-bold text-lg text-white">Temps de Cycle et Parc :</p>
                   <p><span className="text-cyan-400">TC</span> = temps_aller + temps_retour + Tt+Td</p>
                   <p><span className="text-cyan-400">Bus_max</span> = ⌈TC / fréquence⌉</p>
                   <p><span className="text-cyan-400">Parc_affecté</span> = ⌈Bus_max × (1 + γ)⌉</p>

                   <p className="font-bold text-lg text-white pt-4">Kilomètres :</p>
                   <p><span className="text-cyan-400">Km_com</span> = 2 × longueur_ligne × Voyages_AB</p>
                   <p><span className="text-cyan-400">Km_HLP</span> = δ × (2 × Bus_max)</p>
                   <p><span className="text-cyan-400">Km_tech</span> = Km_com × (r_FMDS + r_ACC)</p>
                   <p><span className="text-cyan-400">Km_tot</span> = Km_com + Km_HLP + Km_tech</p>

                   <p className="font-bold text-lg text-white pt-4">Heures et Conducteurs :</p>
                   <p><span className="text-cyan-400">H_total</span> = H_charge + H_HLP + H_tech</p>
                   <p><span className="text-cyan-400">H_payées</span> = H_total × α</p>
                   <p><span className="text-cyan-400">ETP</span> = H_payées / h_poste</p>
                   <p><span className="text-cyan-400">ETP_réserve</span> = ETP × (1 + β)</p>

                   <p className="font-bold text-lg text-white pt-4">Planification des Équipes :</p>
                   <p><span className="text-cyan-400">Duties_day</span> = ⌈(H_total × α_duty) / 7⌉</p>
                   <p><span className="text-cyan-400">Drivers_week</span> = ⌈Duties_day × W⌉  (où W = 7/6)</p>
                   <p><span className="text-cyan-400">Drivers_week_res</span> = ⌈Drivers_week × (1 + β)⌉</p>
                </div>
            </div>
        </div>
    );
};

export default ParametersPage;