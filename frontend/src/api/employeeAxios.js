import axios from "axios";

// Change this to your backend URL
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const employeeAxios = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default employeeAxios;
