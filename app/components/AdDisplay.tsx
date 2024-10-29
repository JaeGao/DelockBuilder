'use client';

import React, { useEffect, useRef } from 'react';

const AdDisplay = () => {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        try {
            // Remove any auto-injected ads at the top
            const autoAds = document.querySelectorAll('ins.adsbygoogle');
            autoAds.forEach((ad) => {
                const parent = ad.parentElement;
                if (parent && !parent.classList.contains('ad-container')) {
                    ad.remove();
                }
            });

            // Initialize our specific ad
            if (typeof window !== 'undefined' && adRef.current) {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            }
        } catch (error) {
            console.error('AdSense error:', error);
        }
    }, []);

    return (
        <div className="ad-container w-full overflow-hidden">
            <ins
                ref={adRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-1757813105299185"
                data-ad-slot="5149825913"
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
};

export default AdDisplay;