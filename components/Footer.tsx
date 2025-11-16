
import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-white border-t mt-auto">
            <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-gray-500">
                    Système d'Analyse du Réseau de Bus - Marrakech 2026-2035
                </p>
            </div>
        </footer>
    );
};

export default Footer;
