export const getApiUrl = () => {

    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL; 
    }

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8000/api';
        }
        
        // Fallback caso acesse via IP na rede local, por exemplo
        return `http://${hostname}:8000/api`;
    }

    // 3. Fallback para Server-Side Rendering (SSR) ou Docker no ambiente local
    return 'http://localhost:8000/api';
};