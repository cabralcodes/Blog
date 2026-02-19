// Carregando módulos
    import express from "express";
    import { engine } from "express-handlebars";
    import bodyParser from "body-parser";
    const app = express();
    import admin from "./routes/admin.js ";
    //import mongoose from "mongoose";
// Configurações
    //Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', engine({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    // Mongoose
        // Em Breve
    //
// Rotas
    app.use('/admin', admin)
// Outros
const PORT = 49823
app.listen(PORT, () => {
    console.log("Servidor rodando!")
})
