import "./shimGlobal";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Loading } from "@teselagen-biotech/ui";

import store from "./store";
import "./index.css";
import App from "./App";

import * as serviceWorker from "./serviceWorker";

const domNode = document.getElementById("root");
const root = createRoot(domNode);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Loading />
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
