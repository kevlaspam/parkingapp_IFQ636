import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001'
    : `http://${window.location.hostname}:5001`,
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
