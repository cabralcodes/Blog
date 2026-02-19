// Carregando módulos
    import express from "express";
    import { engine } from "express-handlebars";
    import bodyParser from "body-parser";
    import admin from "./routes/admin.js";
    //import mongoose from "mongoose";
    import path from "path";
    import { fileURLToPath } from "url";
    const app = express();
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
// Configurações

    //Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())

    // Handlebars
        app.engine('hbs', engine({
        extname: '.hbs',
        defaultLayout: 'main'}))
        app.set('view engine', 'hbs')
        app.set('views', path.join(__dirname, 'views'));
    

    // Mongoose
        // Em Breve

    // Public
        app.use(express.static(path.join(__dirname, "public")))

// Rotas
    app.use('/admin', admin)

// Outros
const PORT = 49823
app.listen(PORT, () => {
    console.log("Servidor rodando!")
})
