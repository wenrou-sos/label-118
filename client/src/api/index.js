import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export function downloadFile(url, filename) {
  return api
    .get(url, { responseType: 'blob' })
    .then((response) => {
      const disposition = response.headers['content-disposition'];
      let finalFilename = filename;
      if (disposition) {
        const utf8Match = disposition.match(/filename\*=UTF-8''(.+)/);
        if (utf8Match) {
          finalFilename = decodeURIComponent(utf8Match[1]);
        } else {
          const match = disposition.match(/filename="?(.+?)"?$/);
          if (match) finalFilename = match[1];
        }
      }
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    });
}

export default api;
