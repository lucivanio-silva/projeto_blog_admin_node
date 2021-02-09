const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Categoria = new Schema({
    nome:{
        type: String,
        require: true
    },
    //é o link para a categoria a url da mesma n pode ter letra maiuscula nem espaço
    slug:{
        type: String,
        require: true
    },
    date:{
        type: Date,
        default: Date.now()
    }
})

mongoose.model('categorias', Categoria)