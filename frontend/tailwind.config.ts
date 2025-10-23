// frontend/tailwind.config.ts
import type { Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: { extend: {} },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        wellgenie: {
          primary:   "#22c55e",
          secondary: "#60a5fa",
          accent:    "#f472b6",
          neutral:   "#1f2937",
          "base-100":"#0f172a",
          "base-200":"#0b1224",
          "base-300":"#111827",
          info:      "#38bdf8",
          success:   "#22c55e",
          warning:   "#f59e0b",
          error:     "#ef4444",
          "--rounded-box": "1.25rem",
          "--rounded-btn": "1rem",
          "--tab-radius":  "1rem",
        },
      },
      "dark", "light",
    ],
  },
} satisfies Config;
