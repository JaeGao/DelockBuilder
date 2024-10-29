'use client';

import React, { useEffect } from 'react';

const GoogleAdsense = () => {
    useEffect(() => {
        try {
            // Disable auto ads completely
            (window as any).adsbygoogle = (window as any).adsbygoogle || [];

            // Add configuration before loading the script
            (window as any).__google_ad_urls = {
                preloadAdBreaks: 'off',
                preloadAutoAds: 'off'
            };

            // Explicitly disable auto ads
            (window as any).googletag = (window as any).googletag || {};
            (window as any).googletag.cmd = (window as any).googletag.cmd || [];
            (window as any).googletag.cmd.push(function () {
                (window as any).googletag.pubads().disableInitialLoad();
            });

            const script = document.createElement('script');
            script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1757813105299185";
            script.async = true;
            script.crossOrigin = "anonymous";
            script.setAttribute('data-ad-frequency-hint', 'rare');
            script.setAttribute('data-overlap-observer-io', 'false');
            document.head.appendChild(script);
        } catch (error) {
            console.error('Error loading AdSense:', error);
        }
    }, []);

    return null;
};

export default GoogleAdsense;