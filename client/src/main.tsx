import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, getInstallPrompt } from "./sw-registration";

// Register service worker for PWA functionality
registerServiceWorker();

// Initialize PWA install prompt
getInstallPrompt();

createRoot(document.getElementById("root")!).render(<App />);
