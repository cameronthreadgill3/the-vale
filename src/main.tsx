import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AccountApp } from "@/account/AccountApp";
import "./styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <AccountApp />
    </StrictMode>,
  );
}
