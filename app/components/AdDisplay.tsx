'use client';

import React, { useEffect, useRef } from 'react';

type AdFormat = 'banner' | 'square' | 'responsive';

interface AdDisplayProps {
    format?: AdFormat;
}

const AdDisplay: React.FC<AdDisplayProps> = ({ format = 'responsive' }) => {
    const adRef = useRef<HTMLModElement>(null);

    const adConfigs = {
        responsive: {
            'data-ad-slot': '5149825913',
            style: { display: 'block', minHeight: '140px' },
            'data-ad-format': 'auto',
            'data-full-width-responsive': 'true',
        },
        banner: {
            'data-ad-slot': '5149825913', // Use your specific banner slot if different
            style: { display: 'block', minHeight: '90px', width: '100%' },
            'data-ad-format': 'horizontal',
            'data-full-width-responsive': 'true',
        },
        square: {
            'data-ad-slot': '5149825913', // Use your specific square slot if different
            style: { display: 'block', minHeight: '250px', width: '300px' },
            'data-ad-format': 'rectangle',
            'data-full-width-responsive': 'false',
        }
    };

    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && adRef.current) {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            }
        } catch (error) {
            console.error('AdSense error:', error);
        }
    }, []);

    const config = adConfigs[format];

    return (
        <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700/30 h-full">
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={config.style}
                data-ad-client="ca-pub-1757813105299185"
                data-ad-slot={config['data-ad-slot']}
                data-ad-format={config['data-ad-format']}
                data-full-width-responsive={config['data-full-width-responsive']}
            />
        </div>
    );
};

export default AdDisplay;