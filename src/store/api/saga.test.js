import Big from "big.js";
import assert from "assert";
import store from "../index.js";
import * as api_calls from "../../helpers/api_calls";
import * as api_helper from "../../helpers/api_helper.js";
import * as actionTypes from "./actionTypes";
import * as mock_helper from "../../helpers/mock_helper";
import * as selectors from "./selectors";
import * as apiRegistry from "../../helpers/apiRegistry";
import { initializeAPIStore } from "../../package-index.js";

const MockAdapter = require("axios-mock-adapter");
const sinon = require("sinon");

let axiosMock;
const baseUrl = "https://test.ensuro.co/api";

beforeEach(() => {
  store.dispatch({ type: "RESET_ALL" });
  axiosMock = new MockAdapter(api_helper.axiosApi);
  apiRegistry.registerAPI(
    "apy",
    (address, days = 7) => `${baseUrl}/etokens/${address}/apr/?days_from=7`,
    (response) => api_calls.toDecimal(response.apy)
  );
  apiRegistry.registerAPI(
    "activePremiums",
    (address, daysFrom = 90, daysTo) =>
      `${baseUrl}/riskmodules/${address}/active_premiums/` +
      api_calls.makeQueryParams(api_calls.addDaysParams(daysFrom, daysTo)),
    (response) => response.data
  );
  apiRegistry.registerAPI(
    "storeUser",
    (address) => `${baseUrl}/wallet/${address}/verify/`,
    (response) => response.token,
    "POST"
  );
});

afterEach(() => {
  store.dispatch({ type: "RESET_ALL" });
  sinon.restore();
  axiosMock.restore();
});

test("API_CALL with simple method", async () => {
  const etkAddress = "0x01";
  mock_helper.setupRiskFieldGets(axiosMock, "0x01");

  initializeAPIStore({ getAPI: apiRegistry.getAPI });

  await store.dispatch({ type: actionTypes.API_CALL, apiName: "apy", args: [etkAddress], method: "GET" });

  assert.strictEqual(selectors.selectAPICall(store.getState().APIReducer, "apy", [etkAddress]), undefined);

  const call_key = `${baseUrl}/etokens/${etkAddress}/apr/?days_from=7`;
  assert.deepStrictEqual(store.getState().APIReducer, {
    call_metadata: {},
    subscriptions: {},
    currentClock: 0,
    calls: {
      [call_key]: {
        state: "LOADING",
      },
    },
  });
  await new Promise((r) => setTimeout(r, 1000));
  assert.deepStrictEqual(store.getState().APIReducer.calls, {
    [call_key]: {
      state: "LOADED",
      value: Big(api_calls.getFieldSumByChar("apy")),
      code: 200,
    },
  });
  assert.ok(
    selectors
      .selectAPICall(store.getState().APIReducer, "apy", [etkAddress])
      .eq(Big(api_calls.getFieldSumByChar("apy")))
  );
});

test("API_CALL method with parameters", async () => {
  const rkAddress = "0x01";
  const days = 90;
  mock_helper.setupRiskFieldGets(axiosMock, "0x01");

  await store.dispatch({
    type: actionTypes.API_CALL,
    apiName: "activePremiums",
    args: [rkAddress, days],
    method: "GET",
  });

  assert.strictEqual(
    selectors.selectAPICall(store.getState().APIReducer, "activePremiums", [rkAddress, days]),
    undefined
  );

  await store.dispatch({
    type: actionTypes.API_CALL,
    apiName: "activePremiums",
    args: [rkAddress, days],
  });

  const call_key = `${baseUrl}/riskmodules/${rkAddress}/active_premiums/?days_from=${days}`;
  assert.deepStrictEqual(store.getState().APIReducer, {
    call_metadata: {},
    subscriptions: {},
    currentClock: 0,
    calls: {
      [call_key]: {
        state: "LOADING",
      },
    },
  });
  await new Promise((r) => setTimeout(r, 0));
  assert.deepStrictEqual(store.getState().APIReducer.calls, {
    [call_key]: {
      state: "LOADED",
      value: `ret${rkAddress}activePremiums`,
      code: 200,
    },
  });

  assert.strictEqual(
    selectors.selectAPICall(store.getState().APIReducer, "activePremiums", [rkAddress, days]),
    `ret${rkAddress}activePremiums`
  );
});

test("API_CALL POST new user success", async () => {
  const userAddress = "0x01";
  mock_helper.setupWalletMocks(axiosMock, "0x01");

  await store.dispatch({
    type: "API_CALL",
    apiName: "storeUser",
    args: [userAddress],
    method: "POST",
    data: { userAddress: userAddress, msgParams: "test", signature: "signature" },
  });

  assert.strictEqual(selectors.selectAPICall(store.getState().APIReducer, "storeUser", [userAddress]), undefined);

  const call_key = `${baseUrl}/wallet/${userAddress}/verify/`;
  assert.deepStrictEqual(store.getState().APIReducer, {
    call_metadata: {},
    subscriptions: {},
    currentClock: 0,
    calls: {
      [call_key]: {
        state: "LOADING",
      },
    },
  });
  await new Promise((r) => setTimeout(r, 1000));
  assert.deepStrictEqual(store.getState().APIReducer.calls, {
    [call_key]: {
      state: "LOADED",
      value: "withPersonaReferenceID",
      code: 200,
    },
  });
});

test("API_CALL with retries", async () => {
  const rmAddress = "0x01";
  axiosMock.onGet(`${baseUrl}/riskmodules/${rmAddress}/active_premiums/`).reply(500);

  initializeAPIStore({ getAPI: apiRegistry.getAPI });

  await store.dispatch({ type: actionTypes.API_CALL, apiName: "activePremiums", args: [rmAddress] });

  const call_key = `${baseUrl}/riskmodules/${rmAddress}/active_premiums/?days_from=90`;
  assert.deepStrictEqual(store.getState().APIReducer, {
    call_metadata: {},
    subscriptions: {},
    currentClock: 0,
    calls: {
      [call_key]: {
        state: "LOADING",
      },
    },
  });
  await new Promise((r) => setTimeout(r, 15));

  assert.deepStrictEqual(store.getState().APIReducer, {
    call_metadata: {},
    subscriptions: {},
    currentClock: 0,
    calls: {
      [call_key]: {
        state: "LOADING",
        retries: 1,
      },
    },
  });
});

test("API_CALL with timestamp", async () => {
  const etkAddress = "0x01";
  mock_helper.setupRiskFieldGets(axiosMock, "0x01");

  await store.dispatch({ type: actionTypes.API_CALL, apiName: "apy", args: [etkAddress], method: "GET" });
  await new Promise((r) => setTimeout(r, 1000));

  const key = `${baseUrl}/etokens/${etkAddress}/apr/?days_from=7`;
  const prevTimestamp = selectors.selectAPICallTimestampByKey(store.getState().APIReducer, key);

  await store.dispatch({ type: actionTypes.API_CALL, apiName: "apy", args: [etkAddress], method: "GET" });
  await new Promise((r) => setTimeout(r, 1000));
  let newTimestamp = selectors.selectAPICallTimestampByKey(store.getState().APIReducer, key);
  assert.strictEqual(prevTimestamp, newTimestamp);

  await store.dispatch({ type: actionTypes.API_CALL, apiName: "apy", args: [etkAddress], method: "GET", maxAge: 100 });
  await new Promise((r) => setTimeout(r, 1000));

  newTimestamp = selectors.selectAPICallTimestampByKey(store.getState().APIReducer, key);
  assert.notStrictEqual(prevTimestamp, newTimestamp);
});

//
test("API_ADD_SUBSCRIPTION and API_DISPATCH_CLOCK with one ethCall", async () => {
  const etkAddress = "0x01";
  const call_key = `${baseUrl}/etokens/${etkAddress}/apr/?days_from=7`;
  mock_helper.setupRiskFieldGets(axiosMock, "0x01");

  await store.dispatch({
    type: "API_ADD_SUBSCRIPTION",
    key: "apyTestComponent",
    componentApiCalls: [{ apiName: "apy", args: [etkAddress], method: "GET" }],
  });

  assert.deepStrictEqual(store.getState().APIReducer, {
    subscriptions: {
      apyTestComponent: {
        clockCount: 10,
        nextClock: 0,
        functions: [{ apiName: "apy", args: [etkAddress], method: "GET" }],
      },
    },
    call_metadata: {},
    calls: {},
    currentClock: 0,
  });

  assert.strictEqual(selectors.selectAPICall(store.getState().APIReducer, "apy", [etkAddress]), undefined);
  store.dispatch({ type: "API_DISPATCH_CLOCK" });

  await new Promise((r) => setTimeout(r, 1000));
  assert.deepStrictEqual(store.getState().APIReducer.calls, {
    [call_key]: {
      state: "LOADED",
      value: Big(api_calls.getFieldSumByChar("apy")),
      code: 200,
    },
  });
  assert.ok(
    selectors
      .selectAPICall(store.getState().APIReducer, "apy", [etkAddress])
      .eq(Big(api_calls.getFieldSumByChar("apy")))
  );
});

test("API_ADD_SUBSCRIPTION and API_DISPATCH_CLOCK with two apiCall", async () => {
  const etkAddress = "0x01";
  const rkAddress = "0x01";
  mock_helper.setupRiskFieldGets(axiosMock, "0x01");

  await store.dispatch({
    type: "API_ADD_SUBSCRIPTION",
    key: "testComponent",
    componentApiCalls: [
      { apiName: "apy", args: [etkAddress] },
      { apiName: "activePremiums", args: [rkAddress, 90] },
    ],
  });

  assert.deepStrictEqual(store.getState().APIReducer, {
    subscriptions: {
      testComponent: {
        clockCount: 10,
        nextClock: 0,
        functions: [
          { apiName: "apy", args: [etkAddress] },
          { apiName: "activePremiums", args: [rkAddress, 90] },
        ],
      },
    },
    call_metadata: {},
    calls: {},
    currentClock: 0,
  });

  assert.strictEqual(selectors.selectAPICall(store.getState().APIReducer, "apy", [etkAddress]), undefined);

  store.dispatch({ type: "API_DISPATCH_CLOCK" });
  const apy_call_key = `${baseUrl}/etokens/${etkAddress}/apr/?days_from=7`;
  const active_premiums_call_key = `${baseUrl}/riskmodules/${rkAddress}/active_premiums/?days_from=90`;

  await new Promise((r) => setTimeout(r, 0));

  assert.deepEqual(store.getState().APIReducer.calls, {
    [apy_call_key]: {
      state: "LOADED",
      value: Big(api_calls.getFieldSumByChar("apy")),
      code: 200,
    },
    [active_premiums_call_key]: {
      state: "LOADED",
      value: `ret${rkAddress}activePremiums`,
      code: 200,
    },
  });

  const [apy, actPremiums] = selectors.selectAPICallMultiple(store.getState().APIReducer, [
    { apiName: "apy", args: [etkAddress] },
    { apiName: "activePremiums", args: [rkAddress, 90] },
  ]);

  assert.ok(apy.value.eq(Big(api_calls.getFieldSumByChar("apy"))));
  assert.ok(actPremiums.value === "ret0x01activePremiums");
});

test("ONE call and remove the subscription", async () => {
  const etkAddress = "0x01";
  mock_helper.setupRiskFieldGets(axiosMock, "0x01");

  await store.dispatch({
    type: "API_ADD_SUBSCRIPTION",
    key: "testComponent",
    componentApiCalls: [{ apiName: "apy", args: [etkAddress] }],
  });

  assert.deepStrictEqual(store.getState().APIReducer, {
    currentClock: 0,
    call_metadata: {},
    calls: {},
    subscriptions: {
      testComponent: {
        clockCount: 10,
        nextClock: 0,
        functions: [{ apiName: "apy", args: [etkAddress] }],
      },
    },
  });

  const call_key = `${baseUrl}/etokens/${etkAddress}/apr/?days_from=7`;
  assert.strictEqual(selectors.selectAPICall(store.getState().APIReducer, "apy", [etkAddress]), undefined);
  store.dispatch({ type: "API_DISPATCH_CLOCK" });

  await new Promise((r) => setTimeout(r, 1000));
  assert.deepStrictEqual(store.getState().APIReducer.calls, {
    [call_key]: {
      state: "LOADED",
      value: Big(api_calls.getFieldSumByChar("apy")),
      code: 200,
    },
  });
  assert.ok(
    selectors
      .selectAPICall(store.getState().APIReducer, "apy", [etkAddress])
      .eq(Big(api_calls.getFieldSumByChar("apy")))
  );

  await store.dispatch({ type: "API_REMOVE_SUBSCRIPTION", key: "testComponent" });
  assert.deepStrictEqual(store.getState().APIReducer.subscriptions, {});
});
