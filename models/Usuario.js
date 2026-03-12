import mongoose from "mongoose";
import { Schema } from "mongoose";

const usuario = new Schema({
    nome: {
        type: String,
        required: true,

    },
    email: {
        type: String,
        required: true
    },

    eAdmin: {
        type: Number,
        default: 0
    },

    senha: {
        type: String,
        required: true
    }

})

export default mongoose.model("usuarios", usuario)
