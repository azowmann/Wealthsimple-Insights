import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

const client = axios.create({
    baseURL: API_BASE,
});

export const uploadPortfolio = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await client.post("/portfolio/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const getHoldings = async (portfolioId) => {
    const res = await client.get(`/holdings/${portfolioId}`);
    return res.data;
};

export const getMetrics = async (portfolioId) => {
    const res = await client.get(`/metrics/${portfolioId}`);
    return res.data;
};