import axios from 'axios';

const getBaseURL = () => {
  const hostname = window.location.hostname;
  if (hostname.includes('vercel.app')) {
    return `${window.location.origin}/_/backend`;
  }
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5001';
  }
  return `http://${hostname}:5001`;
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
