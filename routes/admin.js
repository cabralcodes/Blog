import express from "express";
import mongoose from "mongoose";
import Categoria from "../models/Categoria.js";
import Postagem from "../models/Postagem.js";
import {Router} from "express";
import eAdmin from "../helpers/eAdmin.js";
import estaLogado from "../helpers/estaLogado.js";
import podeEditarPost from "../middlewares/permissoes.js";
import Usuario from "../models/Usuario.js";
const router = Router();

router.get('/', eAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/posts', estaLogado, (req,res) => {
    res.send("Página de posts")
})

router.get("/categorias", estaLogado, (req, res) => {
    Categoria.find().sort({date:'desc'}).populate("usuario").lean().then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin")
    })
    })

router.post("/categorias/nova", eAdmin, (req, res) =>{
    
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

router.post("/categorias/deletar", estaLogado, (req,res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
    res.render("admin/editcategorias", {categoria: categoria})    
    }).catch((err) => {
        req.flash("error_msg", "Essa categoria não existe")
        res.redirect("admin/categorias")
    })
    
})

router.get("/categorias/add", eAdmin, (req,res) => {
    res.render("admin/addcategorias")
})

router.get("/postagens", estaLogado, (req,res) =>{
    Postagem.find().lean().populate("categoria").populate("usuario").sort({data: "desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        console.log("ERRO DETALHADO:", err)
        res.redirect("/admin")
    })

    
})

router.get("/postagens/add", estaLogado, (req,res)=> {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", estaLogado, (req,res) => {
    var erros = [];

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre outra categoria"})
    }

    if(erros.length > 0){
         res.render("admin/addpostagem", {erros: erros})
    }else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug,
            usuario: req.user._id
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem Criada com Sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")
        })
    }
})


router.get("/postagens/edit/:id", estaLogado,podeEditarPost, (req,res) => {
   
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })


    }).catch((err)=> {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
        
    })  
})


router.post( "/postagens/edit/:id",estaLogado,podeEditarPost,(req, res) => {

        Postagem.findOne({ _id: req.params.id }).then((postagem) => {

            if (!postagem) {
                req.flash("error_msg", "Postagem não encontrada");
                return res.redirect("/admin/postagens");
            }

            postagem.titulo = req.body.titulo;
            postagem.slug = req.body.slug;
            postagem.descricao = req.body.descricao;
            postagem.conteudo = req.body.conteudo;
            postagem.categoria = req.body.categoria;

            postagem.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso");
                res.redirect("/admin/postagens");
            }).catch((err) => {
                console.log(err);
                req.flash("error_msg", "Erro ao salvar edição");
                res.redirect("/admin/postagens");
            });

        }).catch((err) => {
            console.log(err);
            req.flash("error_msg", "Erro ao carregar postagem");
            res.redirect("/admin/postagens");
        });

    }
);

// Removido o :id da URL e trocado para .post
router.post("/postagens/deletar", estaLogado, (req, res) => {
    // Buscamos pelo ID que vem do formulário (req.body.id)
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!");
        res.redirect("/admin/postagens");
    }).catch((err) => {
        console.error("ERRO NO MONGOOSE:", err); 
        req.flash("error_msg", "Houve um erro interno ao deletar.");
        res.redirect("/admin/postagens");
    });
});

export default router;

