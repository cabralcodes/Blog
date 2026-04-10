import express from "express";
const router = express.Router();
import mongoose from "mongoose";
import Usuario from "../models/Usuario.js";
import Postagem from "../models/Postagem.js";
import Categoria from "../models/Categoria.js";
import bcrypt from "bcryptjs";
import passport from "passport";

// Middleware para impedir que usuários deslogados quebrem o sistema
function eLogado(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error_msg", "Você precisa estar logado para acessar essa página");
    res.redirect("/");
}

// --- ROTAS DE AUTENTICAÇÃO ---

router.get("/registro", (req, res) => {
    res.render("usuarios/registro");
});

router.post("/registro", (req, res) => {
    let erros = [];
    if (!req.body.nome) erros.push({ texto: "Nome inválido" });
    if (!req.body.email) erros.push({ texto: "E-mail inválido" });
    if (!req.body.senha || req.body.senha.length < 4) erros.push({ texto: "Senha muito curta" });
    if (req.body.senha != req.body.senha2) erros.push({ texto: "As senhas são diferentes" });

    if (erros.length > 0) {
        res.render("usuarios/registro", { erros: erros });
    } else {
        Usuario.findOne({ email: req.body.email }).lean().then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Já existe uma conta com esse e-mail");
                res.redirect("/usuario/registro");
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Erro ao salvar usuário");
                            res.redirect("/");
                        }
                        novoUsuario.senha = hash;
                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!");
                            res.redirect("/");
                        }).catch((err) => {
                            req.flash("error_msg", "Erro ao criar o usuário");
                            res.redirect("/usuario/registro");
                        });
                    });
                });
            }
        });
    }
});

router.get("/login", (req, res) => {
    res.render("usuarios/login");
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuario/login",
        failureFlash: true
    })(req, res, next);
});

// --- ROTAS DE POSTAGENS (PROTEGIDAS) ---

router.get("/postagens", eLogado, (req, res) => {
    Postagem.find().lean().populate("categoria").populate("usuario").sort({ data: "desc" }).then((postagens) => {
        res.render("postagensUsuario/index", { postagens: postagens });
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar postagens");
        res.redirect("/");
    });
});

router.get("/postagens/add", eLogado, (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("postagensUsuario/addindex", { categorias: categorias });
    });
});

router.post("/postagens/nova", eLogado, (req, res) => {
    const novaPostagem = {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria,
        slug: req.body.slug,
        usuario: req.user._id
    };
    new Postagem(novaPostagem).save().then(() => {
        req.flash("success_msg", "Postagem criada!");
        res.redirect("/usuario/postagens");
    }).catch(() => {
        res.redirect("/usuario/postagens");
    });
});

router.get("/postagens/editar/:id", eLogado, (req, res) => {
    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
        if (postagem.usuario.toString() !== req.user._id.toString()) {
            req.flash("error_msg", "Não autorizado");
            return res.redirect("/");
        }
        Categoria.find().lean().then((categorias) => {
            res.render("postagensUsuario/editindex", { postagem: postagem, categorias: categorias });
        });
    }).catch(() => res.redirect("/"));
});

router.post("/postagens/editar/salvar", eLogado, (req, res) => {
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {
        if (postagem.usuario.toString() !== req.user._id.toString()) {
            return res.redirect("/");
        }
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem atualizada!");
            res.redirect("/usuario/postagens");
        });
    }).catch(() => res.redirect("/"));
});

router.get("/postagens/deletar/:id", eLogado, (req, res) => {
    Postagem.deleteOne({ _id: req.params.id, usuario: req.user._id }).then(() => {
        req.flash("success_msg", "Deletada!");
        res.redirect("/usuario/postagens");
    });
});

// Rota para listar categorias
router.get("/categorias", eLogado, (req, res) => {
    Categoria.find().lean().sort({ date: "desc" }).then((categorias) => {
        res.render("categoriasUsuario/categorias", { categorias: categorias });
    }).catch((err) => {
        req.flash("error_msg", "Erro ao listar categorias");
        res.redirect("/");
    });
});

// Rota para o formulário de adicionar categoria
router.get("/categorias/add", eLogado, (req, res) => {
    res.render("categoriasUsuario/addcategoria");
});

// Rota para salvar a nova categoria
router.post("/categorias/nova", eLogado, (req, res) => {
    // Validação simples
    let erros = [];
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" });
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido" });
    }

    if (erros.length > 0) {
        res.render("usuario/addcategoria", { erros: erros });
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            // Tratando o slug para não ter espaços
            slug: req.body.slug.toLowerCase().trim().replace(/ /g, "-")
        };

        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!");
            res.redirect("/usuario/categorias");
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar a categoria, tente novamente.");
            res.redirect("/usuario/categorias");
        });
    }
});

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) return next(err);
        req.flash("success_msg", "Até logo!");
        res.redirect('/');
    });
});

export default router;
