export const getApiUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    const localDevApi = 'http://localhost:8000/api';

    if (envUrl) {
        return envUrl;
    }

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return localDevApi;
        }

        return `http://${hostname}:8000/api`;
    }

    return localDevApi;
};