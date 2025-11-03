
import { Router } from "express";
import { pool } from "../index.js";
const router = Router();

router.get("/api/medicines", async (req, res) => {
  try{
    const [rows] = await pool.query("SELECT * FROM medicines ORDER BY id DESC");
    res.json({ items: rows });
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

router.post("/api/medicines", async (req, res) => {
  const { name, form, strength, default_frequency, duration, route } = req.body || {};
  if(!name) return res.status(400).json({ error: "name required" });
  try{
    await pool.query(
      "INSERT INTO medicines (name, form, strength, default_frequency, duration, route) VALUES (?, ?, ?, ?, ?, ?)",
      [name || "", form || "", strength || "", default_frequency || "", duration || "", route || ""]
    );
    res.status(201).json({ success: true });
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

export default router;
