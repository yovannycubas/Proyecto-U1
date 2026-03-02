import React, { useEffect } from 'react';

export default function Toast({ message, type = 'success', onClear }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            onClear();
        }, 2800);
        return () => clearTimeout(timer);
    }, [message, onClear]);

    if (!message) return null;

    return (
        <div className={`toast ${type} show`} role="status" aria-live="polite">
            {message}
        </div>
    );
}
