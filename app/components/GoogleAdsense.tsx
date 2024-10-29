'use client';

import React, { useEffect } from 'react';

const GoogleAdsense = () => {
    useEffect(() => {
        try {
            // Initialize adsense with auto ads disabled
            (window as any).adsbygoogle = (window as any).adsbygoogle || [];
            (window as any).adsbygoogle.push({
                google_ad_client: "ca-pub-1757813105299185",
                enable_page_level_ads: false, // Disable automatic ad insertion
            });

            const script = document.createElement('script');
            script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1757813105299185";
            script.async = true;
            script.crossOrigin = "anonymous";
            document.head.appendChild(script);
        } catch (error) {
            console.error('Error loading AdSense:', error);
        }
    }, []);

    return null;
};

export default GoogleAdsense;