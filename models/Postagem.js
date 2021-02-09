const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Postagem = new Schema({
    titulo:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    descricao:{
        type: String,
        required: true
    },
    conteudo:{
        type: String,
        required: true
    },
    categoria:{
        //usado quando queremos relacionar um objeto a um campo no mongo
        type: Schema.Types.ObjectId,
        //nome do model onde está armazenado o objeto
        ref: 'categorias',
        require: true
    },
    data:{
        type: Date,
        default: Date.now()
    }
})

//collection de postagens
mongoose.model('postagens', Postagem)