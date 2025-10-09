import React, { useEffect, useState } from "react";
import axios from "axios";

const App: React.FC = () => {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    axios
      .get("/api/")
      .then((response) => setMessage(response.data.message))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">
          FastAPI + React + Vite + DaisyUI (TypeScript)
        </h1>
        <p className="text-lg text-base-content">
          {message || "Loading from FastAPI..."}
        </p>

        <button
          className="btn btn-primary mt-4"
          onClick={() => alert("DaisyUI Button Clicked!")}
        >
          DaisyUI Button
        </button>
      </div>
    </div>
  );
};

export default App;
