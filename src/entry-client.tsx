import "@vitejs/plugin-react/preamble";
import "./styles.css";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./app";
import type { StoreData } from "./lib/bloom-api";
import { reportLovableError } from "./lib/lovable-error-reporting";

const root = document.getElementById("app");
const initial = document.getElementById("bloom-data");
if (!root || !initial?.textContent)
  throw new Error("The page did not include its initial catalogue.");

hydrateRoot(
  root,
  <BrowserRouter>
    <App initialStore={JSON.parse(initial.textContent) as StoreData} />
  </BrowserRouter>,
  {
    onRecoverableError: (error) => reportLovableError(error, { phase: "hydration" }),
    onUncaughtError: (error) => {
      console.error(error);
      reportLovableError(error, { phase: "render" });
    },
  },
);
