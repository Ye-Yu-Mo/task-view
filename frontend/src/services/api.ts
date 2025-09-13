import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      switch (status) {
        case 400:
          throw new Error(data?.message || '请求参数错误');
        case 401:
          throw new Error('认证失败，请重新登录');
        case 404:
          throw new Error('请求的资源不存在');
        case 409:
          throw new Error(data?.message || '资源冲突');
        case 500:
          throw new Error('服务器内部错误');
        default:
          throw new Error(data?.message || '网络请求失败');
      }
    } else if (error.request) {
      // 网络错误
      throw new Error('网络连接失败，请检查网络');
    } else {
      throw new Error('请求设置错误');
    }
  }
);

export default api;