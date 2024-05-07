import { all, fork } from "redux-saga/effects";
import { apiSaga, initializeAPIStore } from "../package-index";

import { getAPI } from "../helpers/apiRegistry";

const clockCount = 15;
initializeAPIStore({ getAPI, clockCount });

export default function* rootSaga() {
  yield all([
    //public
    fork(apiSaga),
  ]);
}
