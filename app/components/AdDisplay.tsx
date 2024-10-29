'use client';

import React, { useEffect, useRef } from 'react';

const AdDisplay = () => {
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        try {
            // Ensure we're only pushing this specific ad unit
            if (typeof window !== 'undefined' && adRef.current) {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({
                    google_ad_client: "ca-pub-1757813105299185",
                    enable_page_level_ads: false, // Disable automatic ad insertion
                    overlays: false, // Disable overlay ads
                    google_ad_slot: "5149825913",
                });
            }
        } catch (error) {
            console.error('AdSense error:', error);
        }
    }, []);

    return (
        <ins
            ref={adRef}
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