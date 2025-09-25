import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const bootstrap = async () => {
  try {
    console.log("Starting DZ Taxi with Supabase backend...");
  } catch (error) {
    console.error("Error during startup:", error);
  }

  createRoot(document.getElementById("root")!).render(<App />);
};

bootstrap();
