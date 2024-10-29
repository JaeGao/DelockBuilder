'use client'
import React, { useState } from 'react';
import { X } from 'lucide-react';

const AdDisplay = () => {
    const [isVisible, setIsVisible] = useState(true);

    React.useEffect(() => {
        try {
            const adsbygoogle = (window as any).adsbygoogle || [];
            adsbygoogle.push({});
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    if (!isVisible) return null;

    return (
        <div className="bg-gray-800/30 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-700/30 relative h-full">
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 p-1 rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors z-10"
                aria-label="Close ad"
            >
                <X className="w-4 h-4" />
            </button>
            <ins
                className="adsbygoogle"
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    minHeight: '140px'
                }}
                data-ad-client="ca-pub-1757813105299185"
                data-ad-slot="5149825913"
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
};

export default AdDisplay;