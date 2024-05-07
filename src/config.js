module.exports = {
  api: {
    retry: {
      timeout: parseInt(process.env.REACT_APP_API_RETRY_TIMEOUT || 1500),
      count: parseInt(process.env.REACT_APP_API_RETRY_COUNT || 10),
    },
    defaultMaxAge: parseInt(process.env.REACT_APP_API_DEFAULT_MAX_AGE || 60000),
  },
};
