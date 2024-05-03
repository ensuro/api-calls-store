# API-Calls-store

API Calls store for react redux

# How to use

## Install

```bash
npm install --save api-calls-store
```

## Configure

### Add the reducer

In the `reducers.js` file:

```js
import APIReducer from "api-calls-store/src/store/api/reducer";

export default combineReducers({
  // ...
  APIReducer,
});
```

### Add the saga

In the `sagas.js` file:

```js
import { apiSaga, initializeAPIStore } from "api-calls-store/src/package-index";

const clockCount = 15;
initializeAPIStore({
  getAPI,
  clockCount, // clockCount is the amount of times an API_CALL will be skipped - default is 10
});

export default function* rootSaga() {
  yield all([
    // ...
    fork(apiSaga),
  ]);
}
```

### Add the dispatch clock

In the `App.js` add this `useEffect` to dispatch the clock every Xms.
This clock will dispatch an action in the saga every Xms and that action will call the API.

```js
useEffect(() => {
  const interval = setInterval(() => {
    dispatch({ type: "API_DISPATCH_CLOCK" });
  }, 1000);
  return () => clearInterval(interval);
}, [dispatch]);
```

# Actions

```js
/* API */
export const API_CALL = "API_CALL";
export const API_CALL_SUCCESS = "API_CALL_SUCCESS";
export const API_CALL_FAIL = "API_CALL_FAIL";

/*
 * Sample actions
 * {type: API_CALL, apiName: "apy", args: [], method: method || "GET" }
 * {type: API_CALL_SUCCESS, call_key: "0x...", value: 221, code: 200, timestamp: new Date().getTime() }
 * {type: API_CALL_FAIL, call_key: "0x...", value: 221, code: 200, timestamp: new Date().getTime() }
 */

export const API_ADD_SUBSCRIPTION = "API_ADD_SUBSCRIPTION";
export const API_REMOVE_SUBSCRIPTION = "API_REMOVE_SUBSCRIPTION";

/*
 * Sample actions
 * {type: API_ADD_SUBSCRIPTION, key: "positions", componentApiCalls: [{ apiName: "apy", args: [etkAddress] }] }
 * {type: API_REMOVE_SUBSCRIPTION, key: "positions" }
 */

export const API_DISPATCH_CLOCK = "API_DISPATCH_CLOCK";
/*
 * API_DISPATCH_CLOCK -> This clock will dispatch an action in the saga every Xms and that action will call the API.
 */
export const API_SUBSCRIPTION_INCREASE_CLOCK = "API_SUBSCRIPTION_INCREASE_CLOCK";
/*
 * API_SUBSCRIPTION_INCREASE_CLOCK -> This action sets when to call each subscription again
 */
export const API_INCREASE_CLOCK = "API_INCREASE_CLOCK";
/*
 * API_INCREASE_CLOCK -> Increase the general clock to check if the saga should call the API again
 */
```
