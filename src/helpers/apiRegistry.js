const apis = {};

export function registerAPI(apiName, urlFunction, formatter, method = "GET") {
  apis[apiName] = {
    urlFunction,
    formatter,
    method,
  };
  return apis[apiName];
}

export function getAPI(apiName) {
  return apis[apiName];
}
