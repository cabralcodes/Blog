// Carregando módulos
    import express from "express";
    import { engine } from "express-handlebars";
    import bodyParser from "body-parser";
    import admin from "./routes/admin.js";
    import usuarios from "./routes/usuario.js";
    import mongoose from "mongoose";
    import path from "path";
    import { fileURLToPath } from "url";
    import session from "express-session";
    import flash from "connect-flash";
    import { runInNewContext } from "vm";
    const app = express();
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    import Postagem from "./models/Postagem.js";
    import Categoria from "./models/Categoria.js";
    import passport from "passport";
    import auth from "./config/auth.js";
    auth(passport);
// Configurações
    // Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    // Middleware
        app.use((req,res,next) =>{
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null;
            next()
        })


    //Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    // Handlebars
        app.engine('hbs', engine({
        extname: '.hbs',
        defaultLayout: 'main'}))
        app.set('view engine', 'hbs')
        partialsDir: path.join(__dirname, 'views', 'partials')
        app.set('views', path.join(__dirname, 'views'));

    // Mongoose
        mongoose.connect("mongodb://localhost/blogapp").then(() => {
            console.log("Conectado ao MongoDB...")
        }).catch((err) =>{
            console.log("Erro ao se conectar: "+err)
        })

    // Public
        app.use(express.static(path.join(__dirname, "public")))
// Rotas
    app.get('/', (req,res) => {
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })

    app.get("/postagem/:slug", (req,res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem) {
                res.render("postagem/index", {postagem: postagem})
            }else {
                req.flash("error_msg", "Esta postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/categorias", (req,res) => {
        Categoria.find().lean().then( (categoria) => {
            res.render("categorias/index", {categoria: categoria})
        }).catch( (err) =>{
            req.flash("error_msg", "Houve um erro interno ao listar as categorias")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req,res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then( (categoria) => {
            if(categoria) {
                Postagem.find({categoria: categoria._id}).lean().then( (postagens) => {

                    res.render("categorias/postagens", {postagens:postagens, categoria: categoria})
                }).catch( (err) => {
                    req.flash("error_msg", "Houve um erro ao listar os posts!")
                    res.redirect("/")
                })
            }else {
            req.flash("error_msg", "Esta categoria não existe")
            req.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
            res.redirect("/")
         })
    })

    app.get("/404", (req,res) => {
        res.send('Erro 404!')
    })

    app.use('/admin', admin)
    app.use('/usuarios', usuarios)


// Outros
const PORT = 49823
app.listen(PORT, () => {
    console.log("Servidor rodando!")
})
