import _ from "lodash";
import { api as apiConfig } from "../../config";
import { call, put, takeEvery, delay, select } from "redux-saga/effects";
import { selectAPICallTimestampByKey } from "./selectors";

// API Redux States
import { API_CALL, API_CALL_SUCCESS, API_CALL_FAIL, API_DISPATCH_CLOCK, API_INCREASE_COUNT } from "./actionTypes";
import { getAPIFn } from "../../package-index";
import { get, patch, post } from "../../helpers/api_helper.js";

async function apiCall(apiName, args, data, headers) {
  let api = getAPIFn(apiName);
  let url = api.urlFunction(...(args || []));
  let formatter = api.formatter;
  if (api.method === "GET") {
    const response = await get(url, { headers });
    return {
      code: response.status,
      response: formatter === undefined ? response.data : formatter(response.data),
    };
  } else if (api.method === "POST" || api.method === "PATCH") {
    const method = api.method === "POST" ? post : patch;
    const response = await method(url, data, { headers });
    return {
      code: response.status,
      response: formatter === undefined ? response.data : formatter(response.data),
    };
  }
}

export function* makeAPICall({ retry, apiName, args, data, headers, forceCall, maxAge }) {
  let api = getAPIFn(apiName);
  let key = api.urlFunction(...(args || []));
  if (forceCall === undefined) {
    forceCall = api.method !== "GET";
  }
  if (forceCall === undefined || forceCall === false) {
    maxAge = maxAge === undefined ? apiConfig.defaultMaxAge : maxAge;
    const state = yield select((state) => state.APIReducer);
    const timestamp = selectAPICallTimestampByKey(state, key);
    if (timestamp !== undefined) {
      const now = new Date().getTime();
      if (now - timestamp < maxAge) {
        return; // Skip the repeated call
      }
    }
  }
  try {
    const { code, response } = yield call(_.partial(apiCall, apiName, args, data, headers));
    yield put({
      type: code < 400 ? API_CALL_SUCCESS : API_CALL_FAIL,
      call_key: key,
      value: response,
      code: code,
      timestamp: new Date().getTime(),
    });
  } catch (error) {
    retry = (retry || 0) + 1;
    yield delay(apiConfig.retry.timeout * retry);
    if (retry < apiConfig.retry.count) {
      yield put({
        type: API_CALL,
        retry: retry,
        apiName: apiName,
        args: args,
        headers: headers,
        data: data,
        forceCall: forceCall,
      });
    } else {
      yield put({
        type: API_CALL_FAIL,
        payload: error.message,
        call_key: key,
        value: error.response?.data,
        code: error.response?.status,
        error: true,
      });
    }
  }
}

export function* refreshAllSubscriptionsCalls() {
  const state = yield select((state) => state.APIReducer);
  const subscriptions = state.subscriptions;
  const count = state.count;
  const keyArray = new Set();
  const apiCalls = new Set();
  for (const subKey in subscriptions) {
    const next = subscriptions[subKey].nextClock;
    if (next === count) {
      const subscriptionArray = subscriptions[subKey].functions;
      for (const sub of subscriptionArray) {
        let api = getAPIFn(sub.apiName);
        let key = api.urlFunction(...(sub.args || []));
        if (!keyArray.has(key)) apiCalls.add(sub);
        keyArray.add(key);
        yield put({ type: "API_SET_NEXT_CLOCK", key: subKey, newClock: subscriptions[subKey].clockCount + next });
      }
    }
  }
  for (const call of Array.from(apiCalls)) {
    yield put({
      type: "API_CALL",
      apiName: call.apiName,
      args: call.args,
      headers: call.headers,
      method: call.method || "GET",
    });
  }

  yield put({ type: API_INCREASE_COUNT });
}

export function* apiSaga() {
  yield takeEvery(API_CALL, makeAPICall);
  yield takeEvery(API_DISPATCH_CLOCK, refreshAllSubscriptionsCalls);
}

export default apiSaga;