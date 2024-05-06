/**
 * {type: API_CALL, apiName: "apy", args: [], method: method || "GET" }
 */
export const API_CALL = "API_CALL";

/**
 * {type: API_CALL_SUCCESS, call_key: "0x...", value: 221, code: 200, timestamp: new Date().getTime() }
 */
export const API_CALL_SUCCESS = "API_CALL_SUCCESS";

/**
 * {type: API_CALL_FAIL, call_key: "0x...", value: 221, code: 200, timestamp: new Date().getTime() }
 */
export const API_CALL_FAIL = "API_CALL_FAIL";

/**
 * {type: API_ADD_SUBSCRIPTION, key: "positions", componentApiCalls: [{ apiName: "apy", args: [etkAddress] }] }
 */
export const API_ADD_SUBSCRIPTION = "API_ADD_SUBSCRIPTION";

/**
 * {type: API_REMOVE_SUBSCRIPTION, key: "positions" }
 */
export const API_REMOVE_SUBSCRIPTION = "API_REMOVE_SUBSCRIPTION";

/**
 * API_DISPATCH_CLOCK -> This clock will dispatch an action in the saga every Xms and that action will call the API.
 */
export const API_DISPATCH_CLOCK = "API_DISPATCH_CLOCK";

/**
 * API_SUBSCRIPTION_INCREASE_CLOCK -> This action sets when to call each subscription again
 */
export const API_SUBSCRIPTION_INCREASE_CLOCK = "API_SUBSCRIPTION_INCREASE_CLOCK";

/**
 * API_INCREASE_CLOCK -> Increase the general clock to check if the saga should call the API again
 */
export const API_INCREASE_CLOCK = "API_INCREASE_CLOCK";
