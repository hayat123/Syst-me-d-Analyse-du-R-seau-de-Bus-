
import React from 'react';
import { View } from '../types';

interface HeaderProps {
    activeView: View;
    setView: (view: View) => void;
}

const NavLink: React.FC<{
    label: string;
    view: View;
    activeView: View;
    setView: (view: View) => void;
}> = ({ label, view, activeView, setView }) => {
    const isActive = activeView === view;
    return (
        <button
            onClick={() => setView(view)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );
};

const Header: React.FC<HeaderProps> = ({ activeView, setView }) => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        <h1 className="text-xl font-bold text-gray-800 ml-3">Analyse des Lignes de Bus</h1>
                    </div>
                    <nav className="flex items-center space-x-4">
                        <NavLink label="Résumé du Réseau" view="summary" activeView={activeView} setView={setView} />
                        <NavLink label="Lignes" view="overview" activeView={activeView} setView={setView} />
                        <NavLink label="Paramètres" view="params" activeView={activeView} setView={setView} />
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
