import { combineReducers } from "redux";

import { APIReducer } from "api-calls-store";

const IS_TEST = import.meta.env?.MODE === "test";

const wrap = (reducer) =>
  IS_TEST ? (state, action) => (action.type === "RESET_ALL" ? {} : reducer(state, action)) : reducer;

export default wrap(
  combineReducers({
    // public
    APIReducer,
  })
);
