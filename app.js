// Carregando módulos
    import express from "express";
    import handlebars from "handlebars";
    import bodyParser from "body-parser";
    const app = express()
    //import mongoose from "mongoose";
// Configurações
    //Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view enine', 'handlebars')
    // Mongoose
        // Em Breve
    //
// Rotas

// Outros
const PORT = 49823
app.listen(PORT, () => {
    console.log("Servidor rodando!")
})
