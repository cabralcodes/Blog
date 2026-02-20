// Carregando módulos
    import express from "express";
    import { engine } from "express-handlebars";
    import bodyParser from "body-parser";
    import admin from "./routes/admin.js";
    import mongoose from "mongoose";
    import path from "path";
    import { fileURLToPath } from "url";
    import session from "express-session";
    import flash from "connect-flash";
import { runInNewContext } from "vm";
    const app = express();
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
// Configurações
    // Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))
        app.use(flash())
    // Middleware
        app.use((req,res,next) =>{
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
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
    app.use('/admin', admin)

// Outros
const PORT = 49823
app.listen(PORT, () => {
    console.log("Servidor rodando!")
})
