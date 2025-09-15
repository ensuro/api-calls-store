const env =
  (typeof import.meta !== "undefined" && import.meta.env) || (typeof process !== "undefined" && process.env) || {};

export default {
  api: {
    retry: {
      timeout: parseInt(env.VITE_API_RETRY_TIMEOUT || 1500, 10),
      count: parseInt(env.VITE_API_RETRY_COUNT || 10, 10),
    },
    defaultMaxAge: parseInt(env.VITE_API_DEFAULT_MAX_AGE || 60000, 10),
  },
};
