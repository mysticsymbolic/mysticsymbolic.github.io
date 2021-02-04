import React from "react";
import ReactDOM from "react-dom";

const APP_ID = "app";

const appEl = document.getElementById(APP_ID);

if (!appEl) {
  throw new Error(`Unable to find #${APP_ID}!`);
}

const App: React.FC<{}> = () => <p>SUP</p>;

ReactDOM.render(<App />, appEl);
