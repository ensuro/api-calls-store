export { apiSaga } from "./store/api/saga.js";
export { selectAPICall, selectAPICallMultiple } from "./store/api/selectors.js";
export { addRemoveApiSub } from "./utils/helpers/store_helper.js";
export { default as config } from "./config.js";
export { default as APIReducer } from "./store/api/reducer.js";
export { registerAPI, getAPI } from "./helpers/apiRegistry.js";
export { BNToDecimal } from "./utils/helpers/api_calls.js";
export {
  API_CALL,
  API_CALL_SUCCESS,
  API_CALL_FAIL,
  API_ADD_SUBSCRIPTION,
  API_REMOVE_SUBSCRIPTION,
  API_DISPATCH_CLOCK,
  API_SUBSCRIPTION_INCREASE_CLOCK,
  API_INCREASE_CLOCK,
} from "./store/api/actionTypes.js";
export let getAPIFn;
export let defaultCount = 10;

export function initializeAPIStore(options = {}) {
  const { getAPI, clockCount } = options;
  if (typeof getAPI !== "function") {
    throw new Error("The getAPI function is required to use the package");
  }
  getAPIFn = getAPI;
  if (typeof clockCount === "number") defaultCount = clockCount;
}
