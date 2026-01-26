// services/api-dashboard.ts
import axios from "axios"

// Usar variável de ambiente se disponível
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://systock-analytics-api.onrender.com"

export const apiDashboard = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export default apiDashboard