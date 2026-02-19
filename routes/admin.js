import express from "express";
import { model } from "mongoose";
const router = express.Router();

router.get('/', (req, res) => {
    res.send("Página principal do painel ADM")
})

router.get('/posts', (req,res) => {
    res.send("Página de posts")
})

router.get("/categorias", (req, res) => {
    res.send("Página de categorias")
})

export default router;
