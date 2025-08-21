import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, getInstallPrompt } from "./sw-registration";
import { initializePushNotifications, registerBackgroundSync } from "./push-notifications";

// Register service worker for PWA functionality
registerServiceWorker();

// Initialize PWA install prompt
getInstallPrompt();

// Initialize push notifications and background sync
initializePushNotifications();
registerBackgroundSync();

createRoot(document.getElementById("root")!).render(<App />);
