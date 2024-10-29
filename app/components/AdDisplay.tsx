'use client';

import React, { useEffect } from 'react';

const AdDisplay = () => {
    useEffect(() => {
        try {
            const adsbygoogle = (window as any).adsbygoogle;
            if (adsbygoogle) {
                adsbygoogle.push({});
            }
        } catch (error) {
            console.error('AdSense error:', error);
        }
    }, []);

    return (
        <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-1757813105299185"
            data-ad-slot="5149825913"
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    );
};

export default AdDisplay;