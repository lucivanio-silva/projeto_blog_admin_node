const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
//model de usuario
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
//model para encriptar senhas do usuario em hash
const bcrypt = require('bcryptjs')
//model do passport
const passport = require('passport')

//------------------------------------------rotas de cadastro de usuario------------------------------------------
//rota para formulario de cadastro
router.get('/registro', (req,res)=>{
    res.render('usuarios/registro')
})

//rota para cadastrar usuario
router.post('/registro', (req, res)=>{
    //validação do formulário
    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido'})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: 'Email inválido'})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: 'senha inválida'})
    }
    if(req.body.senha.length < 4){
        erros.push({texto: 'senha muito curta'})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: 'as senhas não coincidem'})
    }

    //se não houver nenhum erro salva o usuario
    if(erros.length > 0){
        res.render('usuarios/registro', {erros: erros})
    }else{
        //verificando se já existe email no banco
        Usuario.findOne({email: req.body.email}).then((usuario)=>{
            if(usuario){
                req.flash('error_msg', 'Já existe um usuario com esse e-mail')
                res.redirect('/usuario/registro')
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt)=>{
                    //metodo que cria o hash
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
                        if(erro){
                            req.flash('error_msg', 'houve um erro durante o salvamento: '+ erro)
                            res.redirect('/usuario/registro')
                        }

                        //guardando a senha encryptada
                        novoUsuario.senha = hash

                        //salvando o usuario no BD com senha já encriptada
                        novoUsuario.save().then(()=>{
                            req.flash('success_msg', 'Usuário criado com sucesso')
                            res.redirect('/')
                        }).catch((erro)=>{
                            req.flash('error_msg', 'Erro ao criar usuário: '+ erro)
                            res.redirect('/usuario/registro')
                        })
                    })
                })
            }
        }).catch((erro)=>{
            req.flash('error_msg', 'erro interno: '+ erro)
            res.redirect('/')
        })
    }
})

//----------------------------------------rotas de login--------------------------------------------------
router.get('/login', (req, res)=>{
    res.render('usuarios/login')
})

//rota de autenticação
router.post('/login',(req, res, next)=>{
    //função usada sempre que vc quer autenticar alguma coisa
    passport.authenticate('local', {
        //caminho a redirecionar caso a autenticação ocorra com sucesso
        successRedirect: '/',
        //caminho a redirecionar caso ocorra um erro no login
        failureRedirect: '/usuario/login',
        //habilitando as mensagens flash
        failureFlash: true
    })(req, res, next) //passando os parametros novamente
})

//rota para efetuar o logout
router.get('/logout', (req, res)=>{
    //automaticamente o passport faz logout pra você
    req.logout()
    req.flash('success_msg', 'Deslogado  com sucesso')
    res.redirect('/')
})

module.exports = router