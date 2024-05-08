export function addRemoveApiSub(dispatch, key, apiCalls, clockCount) {
  dispatch({ type: "API_ADD_SUBSCRIPTION", key: key, componentApiCalls: apiCalls, clockCount: clockCount });
  return () => {
    dispatch({ type: "API_REMOVE_SUBSCRIPTION", key: key });
  };
}
