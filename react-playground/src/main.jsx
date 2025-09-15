import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Buffer } from "buffer";
import store from "./store";

const app = (
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);

window.Buffer = window.Buffer || Buffer;
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(app);
