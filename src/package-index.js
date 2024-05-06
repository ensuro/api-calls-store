export { apiSaga } from "./store/api/saga";

// Helpers
let getAPIFn;
let defaultCount;

export function initializeAPIStore(options) {
  const { getAPI, clockCount } = options;

  if (!getAPI) throw new Error("The getAPI function is required to use the package");
  getAPIFn = getAPI;
  defaultCount = clockCount || 10;
}

export { getAPIFn, defaultCount };
