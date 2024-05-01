export { apiSaga } from "./store/api/saga";

// Helpers
let getAPIFn;
let defaultCount;

export function initializeAPIStore(options) {
  const { getAPI, clockCount } = options;

  getAPIFn = getAPI;
  defaultCount = clockCount || 10;
}

export { getAPIFn, defaultCount };
