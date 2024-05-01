import { defaultCount, getAPIFn } from "../../package-index";
import {
  API_ADD_SUBSCRIPTION,
  API_CALL,
  API_CALL_FAIL,
  API_CALL_SUCCESS,
  API_INCREASE_CLOCK,
  API_REMOVE_SUBSCRIPTION,
  API_SUBSCRIPTION_SET_NEXT_CLOCK,
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
      let newCallState = state.calls[key] ? { ...state.calls[key] } : {};
      if (newCallState.state !== "LOADED") newCallState.state = "LOADING";
      if (action.retry !== undefined) newCallState.retries = action.retry;
      state = { ...state, calls: { ...state.calls, [key]: newCallState } };
      break;

    case API_CALL_SUCCESS:
      state = {
        ...state,
        calls: {
          ...state.calls,
          [action.call_key]: {
            state: "LOADED",
            value: action.value,
            code: action.code,
          },
        },
        call_metadata: {
          ...state.call_metadata,
          [action.call_key]: {
            ...(state.call_metadata[action.call_key] || {}),
            timestamp: action.timestamp,
          },
        },
      };
      break;

    case API_CALL_FAIL:
      state = {
        ...state,
        calls: {
          ...state.calls,
          [action.call_key]: {
            ...state.calls[action.call_key],
            state: "ERROR",
            code: action.code,
          },
        },
      };
      break;

    case API_ADD_SUBSCRIPTION:
      const dict = {
        functions: action.componentApiCalls,
        clockCount: action.clockCount || defaultCount,
        nextClock: state.currentClock,
      };
      state = modifyNode(state, ["subscriptions", action.key], () => dict);
      break;

    case API_REMOVE_SUBSCRIPTION:
      let subs = { ...state.subscriptions };
      delete subs[action.key];
      state = { ...state, subscriptions: subs };
      break;

    case API_SUBSCRIPTION_SET_NEXT_CLOCK:
      state = modifyNode(state, ["subscriptions", action.key, "nextClock"], () => action.newClock);
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
