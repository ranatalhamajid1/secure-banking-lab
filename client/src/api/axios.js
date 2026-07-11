import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 15000
});

let isRefreshing = false;
let failedQueue = [];
let sessionToastShown = false;

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

// Suppress session expired toast for guest-status checks
const SILENT_URLS = ['/auth/me', '/auth/refresh'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const requestUrl = originalRequest.url || '';

    // If the refresh endpoint itself fails, dispatch unauthorized and stop
    if (error.response?.status === 401 && requestUrl === '/auth/refresh') {
      window.dispatchEvent(new Event('unauthorized'));
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          originalRequest._retry = true;
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

        // Only show session expired toast once, and NOT for silent guest checks
        const isSilentUrl = SILENT_URLS.some(u => requestUrl.includes(u));
        if (!isSilentUrl && !sessionToastShown) {
          sessionToastShown = true;
          toast.error('Session expired. Please log in again.', {
            id: 'session-expired',
            duration: 4000
          });
          // Reset flag after toast dismisses
          setTimeout(() => { sessionToastShown = false; }, 5000);
        }

        window.dispatchEvent(new Event('unauthorized'));
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;