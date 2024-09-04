import _ from "lodash";
import Big from "big.js";
import store from "../index.js";
import assert from "assert";
import * as apiRegistry from "../../helpers/apiRegistry";
import { selectAPICallMultiple, getCallKey } from "./selectors";
import MockAdapter from "axios-mock-adapter";
import * as api_calls from "../../utils/helpers/api_calls";
import * as mock_helper from "../../helpers/mock_helper";
import axios from "axios";

const sinon = require("sinon");

const baseUrl = "https://testapi.com/api";
const currencyAddress = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
let axiosMock;

beforeEach(() => {
  axiosMock = new MockAdapter(axios);
  mock_helper.setupRiskFieldGets(axiosMock, currencyAddress);

  apiRegistry.registerAPI(
    "apy",
    (address, days = 7) => `${baseUrl}/etokens/${address}/apr/?days_from=${days}`,
    (response) => api_calls.toDecimal(response.apy)
  );

  apiRegistry.registerAPI(
    "activePremiums",
    (address, daysFrom = 90, daysTo) =>
      `${baseUrl}/riskmodules/${address}/active_premiums/` +
      api_calls.makeQueryParams(api_calls.addDaysParams(daysFrom, daysTo)),
    (response) => response.data
  );
});

afterEach(() => {
  store.dispatch({ type: "RESET_ALL" });
  sinon.restore();
  axiosMock.restore();
});

describe("selectAPICallMultiple with activePremiums and apy", () => {
  test("should return call_key for apy", () => {
    const expectedUrl = `${baseUrl}/etokens/${currencyAddress}/apr/?days_from=7`;
    const apiFunction = apiRegistry.getAPI("apy");

    const callKey = apiFunction.urlFunction(currencyAddress);

    expect(callKey).toEqual(expectedUrl);
  });

  test("should return call_key for activePremiums", () => {
    const expectedUrl = `${baseUrl}/riskmodules/${currencyAddress}/active_premiums/?days_from=90`;
    const apiFunction = apiRegistry.getAPI("activePremiums");

    const callKey = apiFunction.urlFunction(currencyAddress, 90);

    expect(callKey).toEqual(expectedUrl);
  });

  test("should return the corresponding calls for apy when present with actions", async () => {
    const call_key = getCallKey({ currentChain: { id: 1234, rpc: "https://foo-rpc.com/" } }, "apy", [currencyAddress]);
    store.dispatch({ type: "API_CALL", apiName: "apy", args: [currencyAddress] });

    let result = selectAPICallMultiple(store.getState().APIReducer, [{ apiName: "apy", args: [currencyAddress] }]);
    expect(result).toEqual([{ state: "LOADING" }]);

    store.dispatch({ type: "API_CALL_SUCCESS", call_key: call_key, value: 1000, timestamp: new Date().getTime() });
    result = selectAPICallMultiple(store.getState().APIReducer, [{ apiName: "apy", args: [currencyAddress] }]);
    expect(result).toEqual([{ state: "LOADED", value: 1000 }]);

    let result2 = selectAPICallMultiple(store.getState().APIReducer, [{ apiName: "apy", args: [currencyAddress] }]);
    assert.strictEqual(result[0], result2[0]);
  });

  test("should return the corresponding calls for activePremiums with different states", async () => {
    const call_key = getCallKey({ currentChain: { id: 1234, rpc: "https://foo-rpc.com/" } }, "activePremiums", [
      currencyAddress,
    ]);
    store.dispatch({ type: "API_CALL", apiName: "activePremiums", args: [currencyAddress] });

    let result = selectAPICallMultiple(store.getState().APIReducer, [
      { apiName: "activePremiums", args: [currencyAddress] },
    ]);
    expect(result).toEqual([{ state: "LOADING" }]);

    store.dispatch({
      type: "API_CALL_SUCCESS",
      call_key: call_key,
      value: `ret${currencyAddress}activePremiums`,
      timestamp: new Date().getTime(),
    });

    result = selectAPICallMultiple(store.getState().APIReducer, [
      { apiName: "activePremiums", args: [currencyAddress] },
    ]);

    expect(result).toEqual([{ state: "LOADED", value: `ret${currencyAddress}activePremiums` }]);
  });

  test("should handle multiple calls with different states for apy and activePremiums", async () => {
    const apyCallKey = getCallKey({ currentChain: { id: 1234, rpc: "https://foo-rpc.com/" } }, "apy", [
      currencyAddress,
    ]);

    const activePremiumsCallKey = getCallKey(
      { currentChain: { id: 1234, rpc: "https://foo-rpc.com/" } },
      "activePremiums",
      [currencyAddress]
    );

    store.dispatch({ type: "API_CALL", apiName: "apy", args: [currencyAddress] });
    store.dispatch({
      type: "API_CALL",
      apiName: "activePremiums",
      args: [currencyAddress],
    });

    let result = selectAPICallMultiple(store.getState().APIReducer, [
      { apiName: "apy", args: [currencyAddress] },
      { apiName: "activePremiums", args: [currencyAddress] },
    ]);

    expect(result).toEqual([{ state: "LOADING" }, { state: "LOADING" }]);

    store.dispatch({
      type: "API_CALL_SUCCESS",
      call_key: apyCallKey,
      value: 1000,
      timestamp: new Date().getTime(),
    });

    result = selectAPICallMultiple(store.getState().APIReducer, [
      { apiName: "apy", args: [currencyAddress] },
      { apiName: "activePremiums", args: [currencyAddress] },
    ]);

    expect(result).toEqual([{ state: "LOADED", value: 1000 }, { state: "LOADING" }]);

    store.dispatch({
      type: "API_CALL_SUCCESS",
      call_key: activePremiumsCallKey,
      value: `ret${currencyAddress}activePremiums`,
      timestamp: new Date().getTime(),
    });

    result = selectAPICallMultiple(store.getState().APIReducer, [
      { apiName: "apy", args: [currencyAddress] },
      { apiName: "activePremiums", args: [currencyAddress] },
    ]);

    expect(result).toEqual([
      { state: "LOADED", value: 1000 },
      { state: "LOADED", value: `ret${currencyAddress}activePremiums` },
    ]);
  });
});
