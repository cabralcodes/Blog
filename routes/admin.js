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
    Categoria.find().sort({date:'desc'}).lean().then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin")
    })
    })

router.post("/categorias/nova", (req, res) =>{
    
    var erros = []

    if(!req.body.nome || req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Inválido"})
    }
    
    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }
    else{
    
    
    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    }

    new Categoria(novaCategoria).save().then(() =>{
        req.flash("success_msg", "Categoria Criada com Sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
        res.redirect("/admin")
    })
}
})

router.get("/categorias/add", (req,res) => {
    res.render("admin/addcategorias")
})

export default router;
