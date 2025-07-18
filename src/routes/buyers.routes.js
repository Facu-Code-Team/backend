import { Router } from 'express';
import { createSeller, removeBuyer, removeSeller, createsBuyer } from '../services/buyers.services.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import models from '../models/index.js';

const { Buyers, City, Province, Sellers } = models;

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/avatars';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `buyer_${Date.now()}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // "Bearer token..."

  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};


router.get('/buyers/:id', async (req, res) => {
  try {
    const buyer = await Buyers.findByPk(req.params.id, {
      include: [
        {
          model: City,
          as: 'City',
          attributes: ['ID_City', 'Name'],
          include: {
            model: Province,
            as: 'Province',
            attributes: ['ID_Province', 'Name']
          }
        },
        {
          model: Sellers,
          as: 'Seller',
          attributes: ['ID_Sellers']
        }
      ]
    });

    if (buyer) res.json(buyer);
    else res.status(404).json({ error: 'vendedor no encontrado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar vendedor' });
  }
});

router.post('/buyers', async (req, res) => {
  try {
    const newBuyer = await createsBuyer(req.body);

    res.status(201).json(newBuyer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/buyers/:id', upload.single('avatar'), async (req, res) => {
  try {
    const buyer = await Buyers.findByPk(req.params.id);
    if (!buyer) return res.status(404).json({ error: 'No encontrado' });

    // Parseá los campos del formulario (recordá que si usás FormData, están en req.body)
    const data = req.body;

    // Si se subió un archivo, agregalo a los datos
    console.log(req.file)
    if (req.file) {
      data.avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }

    await buyer.update(data);
    res.json(buyer);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

router.delete('/buyers/:id', async (req, res) => {
  try {
    const buyer = await Buyers.findByPk(req.params.id);
    if (!buyer) return res.status(404).json({ error: 'No encontrado' });

    await buyer.destroy();
    res.json({ message: 'Eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar comprador' });
  }
});

const SECRET_KEY = 'chululu';

router.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const buyer = await Buyers.findOne({
      where: { Email: email },
      include: [
        {
          model: City,
          as: 'City',
          attributes: ['ID_City', 'Name'],
          include: {
            model: Province,
            as: 'Province',
            attributes: ['ID_Province', 'Name']
          }
        },
        {
          model: Sellers,
          as: 'Seller',
          attributes: ['ID_Sellers']
        }
      ]
    });


    if (!buyer) {
      return res.status(401).json({ message: 'Email no registrado' });
    }

    if (password !== buyer.Passwords) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: buyer.ID_Buyers, role: 'buyer', isAdmin: buyer.IsAdmin },
      SECRET_KEY,
    );

    return res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: buyer.ID_Buyers,
        name: buyer.BuyersName,
        lastname: buyer.BuyersLastName,
        nickname: buyer.NickName,
        email: buyer.Email,
        dni: buyer.DNI,
        phone: buyer.Phone,
        registrationDate: buyer.RegistrationDate,
        quantityPurchases: buyer.QuantityPurchases,
        avatarUrl: buyer.avatarUrl,
        isAdmin: buyer.IsAdmin,
        city: {
          id: buyer.City.ID_City,
          name: buyer.City.Name,
          province: {
            id: buyer.City.Province.ID_Province,
            name: buyer.City.Province.Name
          }
        },
        seller: buyer.Seller ? { id: buyer.Seller.ID_Sellers } : null,
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.get("/admin/sellers", verifyToken, async (req, res) => {
  const sellerId = req.user?.id;

  const seller = await Buyers.findByPk(sellerId);

  if (!seller || !seller.IsAdmin) {
    return res.status(403).json({ message: "Acceso denegado" });
  }

  try {
    const sellers = await Buyers.findAll({
      include: {
        model: Sellers,
        as: 'Seller',
        required: true,
      },
    });

    res.json(sellers);
  } catch (error) {
    console.error("Error al obtener los vendedores", error);
    res.status(500).json({ message: "Error al obtener los vendedores" });
  }
});

router.delete("/admin/seller/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

  try {
    const deleted = await removeSeller(id);
    if (!deleted) return res.status(404).json({ message: "vendedor no encontrado" });
    res.json({ message: "vendedor eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar vendedor" });
  }
});

router.get("/admin/usuarios", verifyToken, async (req, res) => {
  const userId = req.user?.id;

  const user = await Buyers.findByPk(userId);
  if (!user || !user.IsAdmin) {
    return res.status(403).json({ message: "Acceso denegado" });
  }

  const buyers = await Buyers.findAll();
  res.json(buyers);
});

router.delete("/admin/usuarios/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

  try {
    const deleted = await removeBuyer(id);
    if (!deleted) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
});

router.post('/register-seller', createSeller);

export default router;