import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for WhatsApp sending
  app.post("/api/whatsapp/send", async (req, res) => {
    const { number, message, apiUrl, apiKey } = req.body;

    if (!number || !message) {
      return res.status(400).json({ error: "Number and message are required" });
    }

    // If the user hasn't provided an API URL/Key, we can't send it.
    // But we'll try to use the provided ones or environment variables.
    const finalApiUrl = apiUrl || process.env.WHATSAPP_API_URL;
    const finalApiKey = apiKey || process.env.WHATSAPP_API_KEY;

    if (!finalApiUrl || !finalApiKey) {
      return res.status(400).json({ error: "WhatsApp API URL and Key must be configured in Settings" });
    }

    try {
      // This is a generic implementation. 
      // Most WhatsApp APIs (like UltraMsg) use a simple POST request.
      // We'll assume the user provides a URL that accepts 'to' and 'body' or similar.
      // For UltraMsg: https://api.ultramsg.com/instanceXXXX/messages/chat
      
      const response = await fetch(finalApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          token: finalApiKey,
          to: number.replace(/\D/g, ""),
          body: message,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        res.json({ success: true, data });
      } else {
        res.status(response.status).json({ error: "Failed to send WhatsApp message", details: data });
      }
    } catch (error: any) {
      console.error("WhatsApp API Error:", error);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
