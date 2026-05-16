export const getApiUrl = () => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8000/api';
        }

        return `http://${hostname}:5847/api`;
    }

    return 'http://backend:8000/api';
};