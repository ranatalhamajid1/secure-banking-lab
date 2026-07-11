import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
        return Promise.reject(error);
    }
    
    const originalRequest = error.config;

    // Avoid infinite loops if refresh itself fails
    if (error.response?.status === 401 && originalRequest.url === '/auth/refresh') {
      window.dispatchEvent(new Event('unauthorized'));
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (err) {
        isRefreshing = false;
        processQueue(err, null);
        toast.error('Session expired. Please log in again.', { duration: 6000 });
        window.dispatchEvent(new Event('unauthorized'));
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;