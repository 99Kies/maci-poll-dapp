import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./Store/Store.js";
import App from "./App.jsx";

createRoot(document.getElementById("main")).render(
  <Provider store={store}>
    <App />
  </Provider>
);
