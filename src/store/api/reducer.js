import { defaultCount, getAPIFn } from "../../package-index";
import {
  API_ADD_SUBSCRIPTION,
  API_CALL,
  API_CALL_FAIL,
  API_CALL_SUCCESS,
  API_INCREASE_CLOCK,
  API_REMOVE_SUBSCRIPTION,
  API_SUBSCRIPTION_INCREASE_CLOCK,
} from "./actionTypes";

const INIT_STATE = {
  currentClock: 0,
  calls: {},
  call_metadata: {}, // Different dictionary to avoid re-rendering if only timestamp changes
  /*
   * <call_key>: {timestamp: <timestamp-with-milisecs>}
   */
  subscriptions: {},
  /*
   * <component_key>: [ API call list ]
   */
};

/*
Registers calls in the state. A call looks like this:

{
  state: string, LOADED | LOADING | ERROR,
  apiName: string, an api registered in apiRegistry,
  args: array,

  retries: int, initially undefined,
  value: any, the result from the api call only on success,
}

*/

function modifyNode(state, path, newValueFn) {
  if (path.length === 1) return { ...state, [path[0]]: newValueFn(state[path[0]] || {}) };
  else {
    return {
      ...state,
      [path[0]]: modifyNode(state[path[0]] || {}, path.slice(1, path.length), newValueFn),
    };
  }
}

const APIReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case API_CALL:
      let api = getAPIFn(action.apiName);
      let key = api.urlFunction(...(action.args || []));
      state = modifyNode(state, ["calls", key], (call) => {
        if (call !== undefined && call.state === "LOADED" && call.retries === undefined) {
          return call;
        }
        call = call || {};
        call.state = call.state !== "LOADED" ? "LOADING" : call.state;
        if (action.retry !== undefined) call.retries = action.retry;
        return call;
      });
      break;

    case API_CALL_SUCCESS:
      state = modifyNode(state, ["call_metadata", action.call_key], (x) => {
        return { ...(x || {}), timestamp: action.timestamp };
      });
      state = modifyNode(state, ["calls", action.call_key], (call) => {
        if (call !== undefined && call.state === "LOADED" && call.retries === undefined && call.value === action.value)
          return call;
        return { state: "LOADED", value: action.value, code: action.code };
      });
      break;

    case API_CALL_FAIL:
      state = modifyNode(state, ["calls", action.call_key], (x) => {
        return { ...x, state: "ERROR", code: action.code };
      });
      break;

    case API_ADD_SUBSCRIPTION:
      if (state.subscriptions.hasOwnProperty([action.key]))
        throw new Error(`Subscription '${action.key}' already exists`);
      const dict = {
        functions: action.componentApiCalls,
        clockCount: action.clockCount || defaultCount,
        nextClock: state.currentClock,
      };
      state = modifyNode(state, ["subscriptions", action.key], () => dict);
      break;

    case API_REMOVE_SUBSCRIPTION:
      const { [action.key]: value, ...otherSubs } = state.subscriptions;
      state = { ...state, subscriptions: otherSubs };
      break;

    case API_SUBSCRIPTION_INCREASE_CLOCK:
      state = modifyNode(state, ["subscriptions", action.key], (sub) => {
        return { ...sub, nextClock: sub.nextClock + sub.clockCount };
      });
      break;

    case API_INCREASE_CLOCK:
      const newCount = state.currentClock + 1;
      state = { ...state, currentClock: newCount };
      break;

    default:
      state = { ...state };
      break;
  }
  return state;
};

export default APIReducer;
