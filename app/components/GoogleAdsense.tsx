import Script from "next/script";

const GoogleAdsense = () => {
    if (process.env.NODE_ENV !== "production") {
        console.log('AdSense disabled in development');
        return null;
    }

    return (
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1757813105299185"
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
};

export default GoogleAdsense;