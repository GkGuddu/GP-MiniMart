/**
 * Keep-Alive utility for Render free tier.
 * Pings the backend /health endpoint every 14 minutes to prevent cold starts.
 * Render free tier sleeps after 15 minutes of inactivity.
 */

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
    .replace('/api', '');

const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

let pingInterval = null;

export const startKeepAlive = () => {
    if (import.meta.env.DEV) return; // Only run in production
    if (pingInterval) return; // Already running

    const ping = async () => {
        try {
            await fetch(`${BACKEND_URL}/health`, { method: 'GET' });
            console.log('[KeepAlive] Server pinged successfully');
        } catch {
            // Silently fail - server may be waking up
        }
    };

    // Ping immediately on start, then every 14 minutes
    ping();
    pingInterval = setInterval(ping, PING_INTERVAL_MS);
};

export const stopKeepAlive = () => {
    if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
    }
};
