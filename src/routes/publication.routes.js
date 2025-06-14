import express from "express";
import * as service from "../services/publications.services.js";
import { getSellerByPublicationId } from "../services/publications.services.js";


const router = express.Router();

router.post("/publications", async (req, res) => {
  const { Title, Brand, Price } = req.body;
  if (!Title || !Brand || !Price)
    return res.status(400).json({ message: "Faltan campos obligatorios" });

  try {
    const pub = await service.create(req.body);
    res.status(201).json(pub);
  } catch (e) {
    res.status(500).json({ message: "Error al crear publicación" });
  }
});

router.get("/admin/publicaciones", async (req, res) => {
  try {
    const pubs = await service.getAll();
    res.json(pubs);
  } catch (e) {
    res.status(500).json({ message: "Error al obtener publicaciones (admin)" });
  }
});

router.get("/publications/latest", async (req, res) => {
  try {
    const latestPubs = await service.getLatest(5);
    res.json(latestPubs);
  } catch (e) {
    res.status(500).json({ message: "Error al obtener publicaciones recientes" });
  }
});

router.get("/publications", async (req, res) => {
  try {
    const pubs = await service.getAll();
    res.json(pubs);
  } catch (e) {
    res.status(500).json({ message: "Error al obtener publicaciones" });
  }
});

router.get('/publications/:id/seller', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

    const seller = await getSellerByPublicationId(id);

    if (!seller) return res.status(404).json({ message: 'Vendedor no encontrado' });

    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/publications/:id", async (req, res) => {
  const pub = await service.getById(req.params.id);
  if (!pub) return res.status(404).json({ message: "No encontrada" });
  res.json(pub);
});


router.put("/publications/:id", async (req, res) => {
  const pub = await service.update(req.params.id, req.body);
  if (!pub) return res.status(404).json({ message: "No encontrada" });
  res.json(pub);
});

router.delete("/publications/:id", async (req, res) => {
  const pub = await service.remove(req.params.id);
  if (!pub) return res.status(404).json({ message: "No encontrada" });
  res.json({ message: "Eliminada correctamente" });
});

router.delete("/admin/usuarios/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

  try {
    const deleted = await service.removeBuyer(id);
    if (!deleted) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
});

router.delete("/admin/publicaciones/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

  try {
    const deleted = await service.remove(id);
    if (!deleted) return res.status(404).json({ message: "Publicación no encontrada" });
    res.json({ message: "Publicación eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar publicación" });
  }
});

export default router;