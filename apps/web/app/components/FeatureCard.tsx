import React from 'react';

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    iconBgClass: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, iconBgClass }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className={`w-12 h-12 ${iconBgClass} rounded-lg flex items-center justify-center mb-4`}>
                <span className="text-2xl">{icon}</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400">
                {description}
            </p>
        </div>
    );
};
