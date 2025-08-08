import { StrictMode } from "react"; // StrictMode: Phát hiện bugs trong development
import { createRoot } from "react-dom/client"; // createRoot: React 18 API để render app
import { Provider } from "react-redux"; // Provider: Redux store provider
import { PayPalScriptProvider } from "@paypal/react-paypal-js"; // PayPalScriptProvider: Load PayPal SDK
import store from "./redux/store.js"; // store: Redux store configuration
import "./index.css"; // index.css: Global styles
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(

  <StrictMode>

    <Provider store={store}>

      <PayPalScriptProvider>

        <App />

      </PayPalScriptProvider>
    </Provider>
  </StrictMode>
);
