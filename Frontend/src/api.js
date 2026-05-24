// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const createCustomCandle = async (candleData) => {
  // candleData should include: vessel, scent, toppings, label, and the calculated totalPrice
  const { data } = await API.post('/custom-candle', candleData);
  return data;
};

export default API;