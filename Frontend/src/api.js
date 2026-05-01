// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  // 1. Find the 'token' cookie in the browser
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  // 2. If it exists, manually set the Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export const createCustomCandle = async (candleData) => {
  // candleData should include: vessel, scent, toppings, label, and the calculated totalPrice
  const { data } = await API.post('/custom-candle', candleData);
  return data;
};

export default API;