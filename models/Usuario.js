const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    senha:{
        type: String,
        required: true
    },
    //campo para dizer se o usuário é admin ou não
    eAdmin:{
        type: Number,
        //valor padrão 0 é usuario comun, 1 é admin
        default: 0,
        required:true
    }
})

mongoose.model('usuarios', Usuario)