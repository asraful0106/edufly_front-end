import axios from 'axios';


export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3010',
    withCredentials: true, // send/receive cookies
});