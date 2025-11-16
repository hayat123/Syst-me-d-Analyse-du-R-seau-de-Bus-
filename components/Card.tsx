
import React from 'react';

interface CardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
            <div className={`p-4 rounded-full mr-4`} style={{ backgroundColor: color + '1A' }}>
                <div className={`w-8 h-8`} style={{ color: color }}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};

export default Card;
