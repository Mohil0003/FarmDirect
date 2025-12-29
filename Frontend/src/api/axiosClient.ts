import axios from 'axios';

// 1. Define your Backend URL
// Check your Visual Studio launchSettings.json to confirm this port (often 7000, 7001, 5000, or 5001)
const BASE_URL = 'https://localhost:5234'; 

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Add Interceptor to handle Responses automatically
axiosClient.interceptors.response.use(
    (response) => {
        return response.data; // Return only the data, not the whole HTTP object
    },
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default axiosClient;