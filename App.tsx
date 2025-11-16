
import React, { useState, useMemo, useEffect } from 'react';
import { GlobalParams, BusLineData, CalendarData, CalculatedData, View } from './types';
import { initialParameters, mockBusLines, mockCalendar } from './data/mockData';
import { calculateAllMetrics } from './services/calculationService';
import Header from './components/Header';
import Footer from './components/Footer';
import ParametersPage from './pages/ParametersPage';
import GlobalSummaryPage from './pages/GlobalSummaryPage';
import NetworkOverviewPage from './pages/NetworkOverviewPage';
import LineAnalysisPage from './pages/LineAnalysisPage';

export const DataContext = React.createContext<{
    params: GlobalParams;
    setParams: React.Dispatch<React.SetStateAction<GlobalParams>>;
    lines: BusLineData[];
    setLines: React.Dispatch<React.SetStateAction<BusLineData[]>>;
    calculatedData: CalculatedData | null;
} | null>(null);

const App: React.FC = () => {
    const [view, setView] = useState<View>('summary');
    const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
    const [params, setParams] = useState<GlobalParams>(initialParameters);
    const [lines, setLines] = useState<BusLineData[]>(mockBusLines);
    const [calendar] = useState<CalendarData>(mockCalendar);

    const calculatedData = useMemo(() => {
        try {
            if (lines && calendar && params) {
                return calculateAllMetrics(lines, params, calendar);
            }
            return null;
        } catch (error) {
            console.error("Erreur lors du calcul des métriques:", error);
            alert("Une erreur est survenue lors du traitement des nouvelles données. L'affichage n'a pas pu être mis à jour. Vérifiez la console pour plus de détails.");
            return null;
        }
    }, [lines, params, calendar]);
    
    // Set default selected line when data loads or changes
    useEffect(() => {
        if (calculatedData && calculatedData.lines.length > 0) {
            const currentLineExists = calculatedData.lines.some(l => l.id === selectedLineId);
            if (!currentLineExists || selectedLineId === null) {
                setSelectedLineId(calculatedData.lines[0].id);
            }
        } else {
            setSelectedLineId(null);
        }
    }, [calculatedData, selectedLineId]);


    const renderView = () => {
        if (!calculatedData) {
            return <div className="text-center p-8">Chargement des données ou erreur de calcul...</div>;
        }
        
        switch (view) {
            case 'summary':
                return <GlobalSummaryPage onSelectLine={handleSelectLine} />;
            case 'overview':
                return <NetworkOverviewPage onSelectLine={handleSelectLine} />;
            case 'line-detail':
                const selectedLine = calculatedData.lines.find(l => l.id === selectedLineId);
                return selectedLine ? <LineAnalysisPage lineData={selectedLine} /> : <div>Sélectionnez une ligne pour commencer.</div>;
            case 'params':
                return <ParametersPage />;
            default:
                return <GlobalSummaryPage onSelectLine={handleSelectLine}/>;
        }
    };

    const handleSelectLine = (lineId: string) => {
        setSelectedLineId(lineId);
        setView('line-detail');
    };

    return (
        <DataContext.Provider value={{ params, setParams, lines, setLines, calculatedData }}>
            <div className="min-h-screen flex flex-col font-sans text-gray-800">
                <Header activeView={view} setView={setView} />
                <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
                    {renderView()}
                </main>
                <Footer />
            </div>
        </DataContext.Provider>
    );
};

export default App;
