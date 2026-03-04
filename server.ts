import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import db from "./db.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  
  // States
  app.get("/api/states", (req, res) => {
    const states = db.prepare("SELECT * FROM states WHERE active = 1").all();
    res.json(states);
  });

  app.get("/api/states/:slug", (req, res) => {
    const state = db.prepare("SELECT * FROM states WHERE slug = ?").get(req.params.slug);
    if (!state) return res.status(404).json({ error: "State not found" });
    
    const carousel = db.prepare("SELECT * FROM carousel_images WHERE state_id = ?").all(state.id);
    res.json({ ...state, carousel });
  });

  app.post("/api/admin/states", (req, res) => {
    const { name, slug, cover_image, banner_desktop, banner_mobile, event_date, sales_location } = req.body;
    try {
      const info = db.prepare(`
        INSERT INTO states (name, slug, cover_image, banner_desktop, banner_mobile, event_date, sales_location)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(name, slug, cover_image, banner_desktop, banner_mobile, event_date, sales_location);
      res.json({ id: info.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/admin/states/:id", (req, res) => {
    const { name, slug, cover_image, banner_desktop, banner_mobile, event_date, sales_location } = req.body;
    db.prepare(`
      UPDATE states 
      SET name = ?, slug = ?, cover_image = ?, banner_desktop = ?, banner_mobile = ?, event_date = ?, sales_location = ?
      WHERE id = ?
    `).run(name, slug, cover_image, banner_desktop, banner_mobile, event_date, sales_location, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/states/:id", (req, res) => {
    db.prepare("DELETE FROM states WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Carousel
  app.post("/api/admin/carousel", (req, res) => {
    const { state_id, image_url } = req.body;
    db.prepare("INSERT INTO carousel_images (state_id, image_url) VALUES (?, ?)").run(state_id, image_url);
    res.json({ success: true });
  });

  app.delete("/api/admin/carousel/:id", (req, res) => {
    db.prepare("DELETE FROM carousel_images WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Leads
  app.post("/api/leads", (req, res) => {
    const { state_id, whatsapp, email, dob, instagram, tiktok, profession, education, cpf } = req.body;
    
    // Check for duplicates
    const existing = db.prepare("SELECT id FROM leads WHERE email = ? OR cpf = ?").get(email, cpf);
    if (existing) {
      return res.status(400).json({ error: "E-mail ou CPF já cadastrado." });
    }

    try {
      db.prepare(`
        INSERT INTO leads (state_id, whatsapp, email, dob, instagram, tiktok, profession, education, cpf)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(state_id, whatsapp, email, dob, instagram, tiktok, profession, education, cpf);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/leads", (req, res) => {
    const leads = db.prepare(`
      SELECT l.*, s.name as state_name 
      FROM leads l 
      JOIN states s ON l.state_id = s.id 
      ORDER BY l.created_at DESC
    `).all();
    res.json(leads);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
