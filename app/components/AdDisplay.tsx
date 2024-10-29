'use client';

import React, { useEffect, useRef } from 'react';

const AdDisplay = () => {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && adRef.current) {
                // Clear any existing ads
                const existingAds = document.querySelectorAll('ins.adsbygoogle');
                existingAds.forEach((ad) => {
                    if (ad !== adRef.current) {
                        ad.remove();
                    }
                });

                // Push our specific ad
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({
                    google_ad_client: "ca-pub-1757813105299185",
                    enable_page_level_ads: false,
                    overlays: false,
                    google_ad_slot: "5149825913"
                });
            }
        } catch (error) {
            console.error('AdSense error:', error);
        }
    }, []);

    return (
        <div id="bottom-ad-container">
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