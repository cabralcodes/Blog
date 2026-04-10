// Carregando módulos
import express from "express";
import { engine } from "express-handlebars";
import bodyParser from "body-parser";
import admin from "./routes/admin.js";
import usuario from "./routes/usuario.js"; // Deixei apenas este (verifique se o arquivo tem o 's' no final)
import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import { fileURLToPath } from "url";
import session from "express-session";
import flash from "connect-flash";
import Postagem from "./models/Postagem.js";
import Categoria from "./models/Categoria.js";
import passport from "passport";
import auth from "./config/auth.js";
import moment from "moment";
import Usuario from "./models/Usuario.js";
import bcrypt from "bcryptjs";
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

auth(passport);

// Configurações
    // Sessão (DEVE VIR ANTES DAS ROTAS)
    app.use(session({
        secret: process.env.SESSION_SECRET || "qualquercoisa",
        resave: false,
        saveUninitialized: false
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

    // Middleware Global
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;
        next()
    })

    // Body Parser
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())

    // Handlebars
    app.engine('hbs', engine({
        extname: '.hbs',
        defaultLayout: 'main',
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
        helpers: 
        {
            podeEditar: function (postUser, user, options) {
    if (!user || !postUser) return options.inverse(this);

    // Se postUser for um objeto (populado), pegamos o _id. Se for só o ID, usamos direto.
    const autorId = postUser._id ? postUser._id.toString() : postUser.toString();
    const logadoId = user._id.toString();

    if (autorId === logadoId || user.eAdmin == 1) {
        return options.fn(this);
    }
    return options.inverse(this);
    },
    
    formatDate: (date) => {
            return moment(date).format('DD/MM/YYYY [às] HH:mm');
        }

        }
    }));
    app.set('view engine', 'hbs');
    app.set('views', path.join(__dirname, 'views'));

// Mongoose
const dbURI = process.env.MONGODB_URI || "mongodb://localhost/blogapp";
  mongoose.connect(dbURI)
    .then(() => {
        console.log("Conectado ao MongoDB com sucesso!");
    })
    .catch((err) => {
        console.log("Erro ao conectar ao MongoDB: " + err);
    });

// Public
    app.use(express.static(path.join(__dirname, "public")))

// Rotas Principais
    app.get('/', (req, res) => {
        // Adicionei o populate("usuario") para o nome aparecer na home!
        Postagem.find().lean().populate("categoria").populate("usuario").sort({ data: "desc" }).then((postagens) => {
            res.render("index", { postagens: postagens })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })
    


    // ROTA PÚBLICA PARA LER POSTAGEM COMPLETA
app.get("/postagem/:slug/:id", (req, res) => {
    console.log("Rota acessada!"); // Isso tem que aparecer no terminal
    
    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
        if(postagem) {
            console.log("Postagem encontrada: " + postagem.titulo);
            res.render("postagem/index", { postagem: postagem });
        } else {
            console.log("Postagem não existe no banco.");
            res.send("Erro: Postagem não encontrada no banco de dados.");
        }
    }).catch((err) => {
        console.log("Erro crítico: " + err);
        res.send("Erro no servidor: " + err);
    });
});

// Outros


// Registro de Grupos de Rotas (SEMPRE NO FINAL)
app.use('/admin', admin)
app.use('/usuario', usuario)

app.use((req, res, next) => {
    // Se o usuário tentar acessar uma rota que não existe (o Cannot GET)
    // nós redirecionamos ele para a home ou para o painel admin
    res.status(404).redirect("/"); 
});
const PORT = process.env.PORT || 49823;
app.listen(PORT, () => {
    console.log("Servidor rodando em http://localhost:49823")
})
