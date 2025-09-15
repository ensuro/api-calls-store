import APIReducer from "./reducer.js";
import { toDecimal } from "../../utils/helpers/api_calls.js";
import { initializeAPIStore } from "../../package-index";
import * as apiRegistry from "../../helpers/apiRegistry";

const rmAddress = "0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6"; // RM Getspot Sepolia address
const baseUrl = "https://testapi.com/api";
apiRegistry.registerAPI(
  "activePolicies",
  (address) => `${baseUrl}/policies/?rm=${address}&status=active&limit=1`,
  (response) => response.count
);
apiRegistry.registerAPI(
  "gwp",
  (address) => `${baseUrl}/riskmodules/${address}/gwp/`,
  (response) => toDecimal(response.gwp)
);

describe("API Reducer tests", () => {
  /* Mocking tx receipt function and initialize saga */
  initializeAPIStore({
    getAPI: apiRegistry.getAPI,
    defaultCount: 10,
  });

  const state = {
    currentClock: 0,
    calls: {},
    call_metadata: {},
    subscriptions: {},
  };

  it("Should handle initial state", () => {
    const initialState = state;
    const action = { type: "fake_action" };
    const expectedState = initialState;
    expect(APIReducer(initialState, action)).toEqual(expectedState);
  });

  it("Should add one subscription", () => {
    const action = {
      type: "API_ADD_SUBSCRIPTION",
      key: "foo",
      componentApiCalls: [{ apiName: "activePolicies", args: ["0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6"] }],
    };
    const expectedState = {
      ...state,
      subscriptions: {
        foo: {
          functions: [{ apiName: "activePolicies", args: ["0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6"] }],
          clockCount: 10,
          nextClock: 0,
        },
      },
    };
    expect(APIReducer(state, action)).toEqual(expectedState);
  });

  it("Should remove one subscription", () => {
    const initialState = {
      ...state,
      subscriptions: {
        foo: {
          functions: [{ apiName: "activePolicies", args: ["0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6"] }],
          clockCount: 10,
          nextClock: 0,
        },
      },
    };
    const action = { type: "API_REMOVE_SUBSCRIPTION", key: "foo" };
    const expectedState = {
      ...state,
      subscriptions: {},
    };
    expect(APIReducer(initialState, action)).toEqual(expectedState);
  });

  it("Should add new subscription", () => {
    const initialState = {
      ...state,
      subscriptions: {
        foo: {
          functions: [{ apiName: "activePolicies", args: ["0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6"] }],
          clockCount: 10,
          nextClock: 0,
        },
      },
    };
    const action = {
      type: "API_ADD_SUBSCRIPTION",
      key: "bar",
      clockCount: 25,
      componentApiCalls: [{ apiName: "gwp", args: ["0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6"] }],
    };
    const expectedState = {
      ...state,
      subscriptions: {
        foo: {
          functions: [{ apiName: "activePolicies", args: ["0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6"] }],
          clockCount: 10,
          nextClock: 0,
        },
        bar: {
          functions: [{ apiName: "gwp", args: ["0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6"] }],
          clockCount: 25,
          nextClock: 0,
        },
      },
    };
    expect(APIReducer(initialState, action)).toEqual(expectedState);
  });

  it("Should add one API_CALL", () => {
    const action = { type: "API_CALL", apiName: "gwp", args: [rmAddress] };

    const call_key = "https://testapi.com/api/riskmodules/0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6/gwp/";
    const expectedState = {
      ...state,
      calls: { [call_key]: { state: "LOADING" } },
    };
    expect(APIReducer(state, action)).toEqual(expectedState);
  });

  it("Should add one API_CALL and there is already another one", () => {
    const call_key = "https://testapi.com/api/riskmodules/0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6/gwp/";
    const initialState = {
      ...state,
      calls: { [call_key]: { state: "LOADING" } },
    };

    const action = { type: "API_CALL", apiName: "activePolicies", args: [rmAddress] };
    const call_key2 =
      "https://testapi.com/api/policies/?rm=0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6&status=active&limit=1";
    const expectedState = {
      ...state,
      calls: {
        [call_key]: { state: "LOADING" },
        [call_key2]: { state: "LOADING" },
      },
    };
    expect(APIReducer(initialState, action)).toEqual(expectedState);
  });

  it("Should retry the API_CALL", () => {
    const action = { type: "API_CALL", apiName: "gwp", args: [rmAddress], retry: 5 };
    const call_key = "https://testapi.com/api/riskmodules/0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6/gwp/";
    const expectedState = {
      ...state,
      calls: { [call_key]: { state: "LOADING", retries: 5 } },
    };
    expect(APIReducer(state, action)).toEqual(expectedState);
  });

  it("The API_CALL was successful", () => {
    const call_key = "https://testapi.com/api/riskmodules/0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6/gwp/";
    const initialState = { ...state, calls: { [call_key]: { state: "LOADING" } } };
    const action = {
      type: "API_CALL_SUCCESS",
      call_key: call_key,
      value: 912,
      code: 200,
      timestamp: 1703683845252,
    };

    const expectedState = {
      ...state,
      calls: { [call_key]: { state: "LOADED", value: 912, code: 200, error_detail: null } },
      call_metadata: { [call_key]: { timestamp: 1703683845252 } },
    };
    expect(APIReducer(initialState, action)).toEqual(expectedState);
  });

  it("The API_CALL was successful and there is already another one", () => {
    const call_key = "https://testapi.com/api/riskmodules/0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6/gwp/";
    const call_key2 =
      "https://testapi.com/api/policies/?rm=0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6&status=active&limit=1";
    const initialState = {
      ...state,
      calls: {
        [call_key]: { state: "LOADED", value: 912 },
        [call_key2]: { state: "LOADING" },
      },
      call_metadata: { [call_key]: { timestamp: 1703683845252 } },
    };

    const action = { type: "API_CALL_SUCCESS", call_key: call_key2, value: 10, timestamp: 1703683849000, code: 200 };
    const expectedState = {
      ...state,
      calls: {
        [call_key]: { state: "LOADED", value: 912 },
        [call_key2]: { state: "LOADED", value: 10, code: 200, error_detail: null },
      },
      call_metadata: {
        [call_key]: { timestamp: 1703683845252 },
        [call_key2]: { timestamp: 1703683849000 },
      },
    };
    expect(APIReducer(initialState, action)).toEqual(expectedState);
  });

  it("The API_CALL fails", () => {
    const call_key = "https://testapi.com/api/riskmodules/0x1c749F3057Bb3e8A6448199ce5F4B87E376f7aa6/gwp/";
    const initialState = {
      ...state,
      calls: { [call_key]: { state: "LOADING", retries: 9 } },
    };

    const action = { type: "API_CALL_FAIL", payload: "eth call fails", call_key: [call_key] };
    const expectedState = {
      ...state,
      calls: { [call_key]: { state: "ERROR", retries: 9 } },
    };
    expect(APIReducer(initialState, action)).toEqual(expectedState);
  });

  it("State should not change in default case", () => {
    const initialState = state;
    const action = { type: "API_RANDOM_ACTION" };
    const newState = APIReducer(initialState, action);
    expect(newState).toBe(initialState);
    expect(newState).toStrictEqual(initialState);
  });
});
