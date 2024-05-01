import _ from "lodash";
import { createSelector } from "reselect";
import { getAPIFn } from "../../package-index";

const getCalls = (state) => state.calls;
const getCallMetadata = (state) => state.call_metadata;
const getCallKey = (__, apiName, args) => {
  let api = getAPIFn(apiName);
  return api.urlFunction(...(args || []));
};

const getCallKeys = (__, calls) =>
  _.map(calls, (call) => {
    let api = getAPIFn(call.apiName);
    return api.urlFunction(...(call.args || []));
  });

export const selectAPICall = createSelector(
  [getCalls, getCallKey],
  (calls, callKey) => calls[callKey] && calls[callKey].value
);

export const selectAPICallTimestamp = createSelector(
  [getCallMetadata, getCallKey],
  (callMeta, callKey) => callMeta[callKey] && callMeta[callKey].timestamp
);

export const selectAPICallTimestampByKey = createSelector(
  [getCallMetadata, (__, callKey) => callKey],
  (callMeta, callKey) => callMeta[callKey] && callMeta[callKey].timestamp
);

export const selectAPICallState = createSelector(
  [getCalls, getCallKey],
  (calls, callKey) => calls[callKey] && calls[callKey].state
);

export const selectAPICallMultiple = createSelector([getCalls, getCallKeys], (calls, callKeys) =>
  _.map(callKeys, (callKey) => {
    return calls[callKey] === undefined ? {} : { value: calls[callKey].value, state: calls[callKey].state };
  })
);
