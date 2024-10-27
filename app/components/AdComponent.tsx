'use client';

import React from 'react';

interface AdComponentProps {
    slot: string;
    style?: React.CSSProperties;
}

const AdComponent = ({ slot, style = { display: 'block' } }: AdComponentProps) => {
    React.useEffect(() => {
        try {
            const adsbygoogle = (window as any).adsbygoogle;
            if (adsbygoogle) {
                adsbygoogle.push({});
            }
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    return (
        <ins
            className="adsbygoogle"
            style={style}
            data-ad-client="ca-pub-1757813105299185"
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    );
};

export default AdComponent;