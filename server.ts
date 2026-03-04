import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { db } from "./src/lib/firebase-admin.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  
  // States
  app.get("/api/states", async (req, res) => {
    if (!db) return res.json([]);
    const snapshot = await db.collection("states").where("active", "==", 1).get();
    const states = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(states);
  });

  app.get("/api/states/:slug", async (req, res) => {
    if (!db) return res.status(500).json({ error: "DB not initialized" });
    const snapshot = await db.collection("states").where("slug", "==", req.params.slug).limit(1).get();
    if (snapshot.empty) return res.status(404).json({ error: "State not found" });
    
    const stateDoc = snapshot.docs[0];
    const stateData = stateDoc.data();
    
    const carouselSnapshot = await db.collection("carousel_images").where("state_id", "==", stateDoc.id).get();
    const carousel = carouselSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.json({ id: stateDoc.id, ...stateData, carousel });
  });

  app.post("/api/admin/states", async (req, res) => {
    if (!db) {
      console.error("Attempted to create state but Firebase DB is not initialized.");
      return res.status(500).json({ error: "DB not initialized" });
    }
    const { name, slug, cover_image, banner_desktop, banner_mobile, event_date, sales_location } = req.body;
    try {
      console.log(`Creating state: ${name} (${slug})`);
      const docRef = await db.collection("states").add({
        name, slug, cover_image, banner_desktop, banner_mobile, event_date, sales_location, active: 1
      });
      console.log(`State created successfully with ID: ${docRef.id}`);
      res.json({ id: docRef.id });
    } catch (e: any) {
      console.error("Error creating state in Firestore:", e);
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/admin/states/:id", async (req, res) => {
    if (!db) return res.status(500).json({ error: "DB not initialized" });
    const { name, slug, cover_image, banner_desktop, banner_mobile, event_date, sales_location } = req.body;
    await db.collection("states").doc(req.params.id).update({
      name, slug, cover_image, banner_desktop, banner_mobile, event_date, sales_location
    });
    res.json({ success: true });
  });

  app.delete("/api/admin/states/:id", async (req, res) => {
    if (!db) return res.status(500).json({ error: "DB not initialized" });
    await db.collection("states").doc(req.params.id).delete();
    res.json({ success: true });
  });

  // Carousel
  app.post("/api/admin/carousel", async (req, res) => {
    if (!db) return res.status(500).json({ error: "DB not initialized" });
    const { state_id, image_url } = req.body;
    await db.collection("carousel_images").add({ state_id, image_url });
    res.json({ success: true });
  });

  app.delete("/api/admin/carousel/:id", async (req, res) => {
    if (!db) return res.status(500).json({ error: "DB not initialized" });
    await db.collection("carousel_images").doc(req.params.id).delete();
    res.json({ success: true });
  });

  // Leads
  app.post("/api/leads", async (req, res) => {
    if (!db) return res.status(500).json({ error: "DB not initialized" });
    const { state_id, whatsapp, email, dob, instagram, tiktok, profession, education, cpf } = req.body;
    
    // Check for duplicates
    const emailCheck = await db.collection("leads").where("email", "==", email).limit(1).get();
    const cpfCheck = await db.collection("leads").where("cpf", "==", cpf).limit(1).get();
    
    if (!emailCheck.empty || !cpfCheck.empty) {
      return res.status(400).json({ error: "E-mail ou CPF já cadastrado." });
    }

    try {
      await db.collection("leads").add({
        state_id, whatsapp, email, dob, instagram, tiktok, profession, education, cpf,
        created_at: new Date().toISOString()
      });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/admin/leads", async (req, res) => {
    if (!db) return res.json([]);
    const snapshot = await db.collection("leads").orderBy("created_at", "desc").get();
    const leads = await Promise.all(snapshot.docs.map(async doc => {
      const data = doc.data();
      const stateDoc = await db.collection("states").doc(data.state_id).get();
      return { 
        id: doc.id, 
        ...data, 
        state_name: stateDoc.exists ? stateDoc.data()?.name : "N/A" 
      };
    }));
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
