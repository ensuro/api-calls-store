import { all, fork } from "redux-saga/effects";
import { apiSaga } from "api-calls-store";

export default function* rootSaga() {
  yield all([fork(apiSaga)]);
}
