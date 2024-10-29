'use client';

import React, { useEffect, useRef } from 'react';

const AdDisplay = () => {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && adRef.current) {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            }
        } catch (error) {
            console.error('AdSense error:', error);
        }
    }, []);

    return (
        <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700/30 h-full">
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block', minHeight: '140px' }}
                data-ad-client="ca-pub-1757813105299185"
                data-ad-slot="5149825913"
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
};

export default AdDisplay;