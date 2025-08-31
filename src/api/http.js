import axios from "axios";

const http = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_LINK || "http://localhost:3010",
    headers: { "Content-Type": "application/json" },
});

export default http;
