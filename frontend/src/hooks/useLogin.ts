import { useState } from "react";

export function useLogin(){
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | unknown>(null);
    
    const login = async (username: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const headers = new Headers();
            const creds = `${username.trim()}:${password}`;
            headers.append('Authorization', 'Basic ' + btoa(creds));
            headers.append('Accept', 'application/json');

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: headers,
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text(); // read once
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            const data = await response.json(); // read once when OK
            return data;
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return { login, loading, error }
}