import { initializeDatabase } from "./db.js";
import routes from "./routes/index.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { renderResultShareHtml, resolveIndexHtmlPath } from "../server/sharePage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database on first load
let dbInitialized = false;

export default async function handler(req: any, res: any) {
  // Initialize database once
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }

  const app = express();
  app.use(express.json());
  
  // Use routes
  app.use(routes);
  
  // Handle static files
  const staticPath = path.resolve(__dirname, "..", "public");
  app.use(express.static(staticPath));

  app.get("/resultado/:quizId/:percentage", (request: any, response: any) => {
    const percentage = Number(request.params.percentage || 0);
    const origin = `${request.headers["x-forwarded-proto"] || "https"}://${request.headers.host}`;
    const html = renderResultShareHtml(resolveIndexHtmlPath(staticPath), origin, request.params.quizId, percentage);
    response.send(html);
  });
  
  // Handle client-side routing
  app.get("*", (_req: any, _res: any) => {
    _res.sendFile(path.join(staticPath, "index.html"));
  });

  // Execute the request
  app(req, res);
}
