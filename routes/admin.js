import express from "express";
import mongoose from "mongoose";
import Categoria from "../models/Categoria.js"
const router = express.Router();

router.get('/', (req, res) => {
    res.render("admin/index")
})

router.get('/posts', (req,res) => {
    res.send("Página de posts")
})

router.get("/categorias", (req, res) => {
    res.render("admin/categorias")
})

router.post("/categorias/nova", (req, res) =>{
    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    }

    new Categoria(novaCategoria).save().then(() =>{
        console.log("Categoria salva com sucesso!")
    }).catch((err)=>{
        console.log("Erro ao salvar Categoria: ")
    })
})

router.get("/categorias/add", (req,res) => {
    res.render("admin/addcategorias")
})

export default router;
