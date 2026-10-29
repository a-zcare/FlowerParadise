import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./Themes";

import ErrorBoundary from "./ErrorBoundary";
import "./fonts.css";
import { Provider } from "./store";
import "./style.css";
import "./features.css";
import "./themes.css";
import "./seasonal.css";
import "./ux.css";
import "./commerce.css";
import "./refinements.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <ErrorBoundary>
        <Provider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </Provider>
      </ErrorBoundary>
    </HashRouter>
  </React.StrictMode>,
);
