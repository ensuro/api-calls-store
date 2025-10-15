import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

import "../initialize";
import rootReducer from "./reducers";
import rootSaga from "./sagas";

const sagaMiddleware = createSagaMiddleware();
const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: true,
      immutableCheck: true,
    }).concat(sagaMiddleware),

  devTools: import.meta.env.MODE !== "production",
});

sagaMiddleware.run(rootSaga);

export default store;
