import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeDatabase } from "./integrations/database/databaseInitializer.ts";

// Initialize database on app startup
const initializeApp = async () => {
  try {
    console.log("Initializing application...");
    
    // Initialize database
    const dbInitialized = initializeDatabase();
    
    if (dbInitialized) {
      console.log("Database initialized successfully");
    } else {
      console.error("Failed to initialize database");
    }
    
    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Error initializing application:", error);
  }
  
  // Render the app
  createRoot(document.getElementById("root")!).render(<App />);
};

// Run initialization
initializeApp();