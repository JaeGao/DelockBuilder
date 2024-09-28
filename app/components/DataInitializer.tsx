'use client';

import React, { useEffect, useState } from 'react';

const DataInitializer: React.FC = () => {
    const [status, setStatus] = useState<string>('Checking data...');

    useEffect(() => {
        const initializeData = async () => {
            try {
                const response = await fetch('/api/init-data');
                const data = await response.json();
                setStatus(data.message);
            } catch (error) {
                setStatus('Error initializing data. Please check the console for more information.');
                console.error('Error initializing data:', error);
            }
        };

        initializeData();
    }, []);

    return <div>{status}</div>;
};

export default DataInitializer;