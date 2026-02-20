import mongoose from "mongoose";
import { Schema } from "mongoose";

const Categoria = new Schema({
    nome: {
        type: String,
        require: true
    },
    slug: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

export default mongoose.model("categorias", Categoria)
