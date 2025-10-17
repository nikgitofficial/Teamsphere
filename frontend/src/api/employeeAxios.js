// frontend/src/api/employeeAxios.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const employeeAxios = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// 🔧 Add this interceptor to attach employeeId to every request
employeeAxios.interceptors.request.use((config) => {
  const employeeId = localStorage.getItem("employeeId");
  if (employeeId) {
    config.headers['employeeid'] = employeeId; // lowercase key
  }
  return config;
});


export default employeeAxios;
