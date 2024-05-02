export function addRemoveApiSub(dispatch, key, apiCalls) {
  dispatch({ type: "API_ADD_SUBSCRIPTION", key: key, componentApiCalls: apiCalls });
  return () => {
    dispatch({ type: "API_REMOVE_SUBSCRIPTION", key: key });
  };
}
