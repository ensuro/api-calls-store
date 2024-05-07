import axios from "axios";

//apply base url for axios
export const axiosApi = axios.create({
  validateStatus: (status) => status < 500,
});

axiosApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export async function get(url, config = {}) {
  return axiosApi.get(url, { ...config });
}

export async function post(url, data, config = {}) {
  return axiosApi.post(url, { ...data }, { ...config });
}

export async function put(url, data, config = {}) {
  return axiosApi.put(url, { ...data }, { ...config });
}

export async function patch(url, data, config = {}) {
  return axiosApi.patch(url, { ...data }, { ...config });
}

export async function del(url, config = {}) {
  return axiosApi.delete(url, { ...config });
}
