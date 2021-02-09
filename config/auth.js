const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//model de Usuario
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')


module.exports = (passport)=>{                      //password só se estiver em portugues  //função de callback
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done)=>{
        Usuario.findOne({email: email}).then((usuario)=>{
            //se não houver usuario 
            if(!usuario){
                            //dados da conta a ser autenticada (null porque não foi achada nenhuma)
                            //false porque a autenticação não ocorreu com sucesso
                            //mensagem de retorno
                return done(null, false, {message: 'esta conta não existe'})
            }else{
                //compara a senha fornecida com a senha do usuario encontrado (compara os hashs )
                bcrypt.compare(senha, usuario.senha, (erro, batem)=>{//batem é uma variavel que guarda se as senhas batem ou não
                    if(batem){
                        return done(null, usuario)
                    }else{
                        return done(null, false, {message: 'senha incorreta'})
                    }
                })
            }
        })
    }))

    //serve para salvar os dados do usuario em uma sessão
    passport.serializeUser((usuario, done)=>{
        done(null, usuario.id)
    })
    
    passport.deserializeUser((id, done)=>{
        Usuario.findById(id, (erro, usuario)=>{
            done(erro, usuario)
        })
    })
}