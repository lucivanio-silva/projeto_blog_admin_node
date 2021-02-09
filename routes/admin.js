const express = require('express')
const router = express.Router()
//importa o mongoose
const mongoose = require('mongoose')
//chama o arquivo do model
require('../models/Categoria')
//passa uma referencia do seu model para uma variável
const Categoria = mongoose.model('categorias')//nome deve ser identico ao do model definido no arquivo
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
//model do nosso helper de verificação de quem está logado
//estou pegando somente a função eAdmin
const {eAdmin} = require('../helpers/eAdmin')

//como é um arquivo separado temos que usar o router
//rota principal do admin
router.get('/', eAdmin, (req, res)=>{ //eAdmin só é colocado no final do projeto quando se está verificando altenticação
    //renderiza a página index da pasta admin
    res.render('admin/index')
})

//rota de listagem de posts
router.get('/posts', eAdmin, (req, res)=>{
    res.send('Administração de Posts')
})

//rota de categorias
router.get('/categorias', eAdmin, (req, res)=>{
    //lista todas as categorias do banco
    Categoria.find()
    .sort({date:'desc'})
    .then((categorias)=>{ //.sort({date:'desc'}) lista as categorias por data na ordem decrscente
        //passa um objeto categoria para ser utilizado no categorias.handlebars
       
       //metodo mais seguro e atualizado de usar o handlebars
        const nCategorias = {
           categorias: categorias.map(data =>{
               return{
                   _id: data._id,
                   nome: data.nome,
                   slug: data.slug,
                   date: data.date
               }
           })
       }
       
        res.render('admin/categorias', {categorias: nCategorias.categorias})
    }).catch((erro)=>{
        req.flash('error_msg', 'Erro ao listar categorias')
        res.redirect('/admin/postagens')
    })
})

router.get('/categorias/add', eAdmin, (req, res)=>{
    res.render('admin/addcategoria')
})

//rota que cadastra categorias no banco
router.post('/categorias/nova', eAdmin, (req, res)=>{
 //validação do formulário
    var erros = []
        //se nao houver nome ou o tipo do nome for indefinido ou o nome está vazio
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        //dá erro e é adicionado ao array de erros
        erros.push({texto: 'nome inválido'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        //dá erro e é adicionado ao array de erros
        erros.push({texto: 'slug inválido'})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: 'nome da categoria muito pequeno'})
    }

    if(erros.length > 0 ){
        //rendriza a página de cadastro de categorias passando o objeto erros como parâmetro 
        res.render('admin/addcategoria', {erros: erros})
    }else{
        //caso não houver erros salva a categoria
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(()=>{
            //está inserindo um valor na variavel global de mensagem
            req.flash('success_msg', 'Categoria salva com sucesso')
            res.redirect('/admin/categorias')
        }).catch((err)=>{
            //o flash é um tipo de sessão que só aparece uma vez, se a página for recarregada ela some
            req.flash('error_msg', 'houve um erro ao salvar a categoria')
            res.redirect('/admin')
        })

    }

})

//rota de edição de categoria (recebe um id como parâmetro)
router.get('/categorias/edit/:id', eAdmin, (req, res)=>{
    Categoria.findOne({_id: req.params.id}).then((categoria)=>{
        //metodo mais seguro e atualizado de usar o handlebars
        const novaCategoria ={
            categoria: {
                    _id: categoria._id,
                    nome: categoria.nome,
                    slug: categoria.slug,
                    date: categoria.date
            }
        }
        res.render('admin/editcategorias', {categoria: novaCategoria.categoria})
    }).catch((erro)=>{
        req.flash('error_msg', 'Esta categoria não existe '+ erro)
        res.redirect('/admin/categorias')
    })
    
})

//rota para salvar a edição da categoria
router.post('/categorias/edit', eAdmin, (req, res)=>{

    //validação do formulário
    var erros = []
        //se nao houver nome ou o tipo do nome for indefinido ou o nome está vazio
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        //dá erro e é adicionado ao array de erros
        erros.push({texto: 'nome inválido'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        //dá erro e é adicionado ao array de erros
        erros.push({texto: 'slug inválido'})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: 'nome da categoria muito pequeno'})
    }

    //exibição de erros
    if(erros.length > 0 ){
        //rendriza a página de cadastro de categorias passando o objeto erros como parâmetro 
        res.render('admin/editcategorias', {erros: erros})
    }else{
        //caso não houver erros salva a categoria

        //está buscando a categoria com o id do campo hidden da página de edição de categoria
        Categoria.findOne({_id: req.body.id}).then((categoria)=>{

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(()=>{
                req.flash('success_msg', 'Categoria editada com sucesso')
                res.redirect('/admin/categorias')
            }).catch((erro)=>{
                req.flash('error_msg', 'houve um erro interno ao salvar a edição da categoria')
                res.redirect('/admin/categorias')
            })
        }).catch((erro)=>{
            req.flash('error_msg', 'houve um erro ao editar a categoria')
        })
    }
})

//rota que vai deletar uma categoria
router.post('/categorias/delete', eAdmin, (req, res)=>{
    //método para deletar um registro
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash('success_msg', 'categoria excluida com sucesso')
        res.redirect('/admin/categorias')
    }).catch((erro)=>{
        req.flash('error_msg', 'erro ao exluir categoria')
        res.redirect('/admin/categorias')
    })
})

//-------------------------------------------rotas de postagens-------------------------------------------------

//rota principal postagens
router.get('/postagens', eAdmin, (req, res)=>{
    //método para buscar as postagem com suas devidas categorias relacionadas
                             //nome do campo referenciado pelo id   
    Postagem.find().populate('categoria').sort({date:'desc'})
    .then(postagens =>{
        const nPostagens = {
            postagens: postagens.map(data=>{
                return{
                    _id: data._id,
                    titulo: data.titulo,
                    slug: data.slug,
                    descricao: data.descricao,
                    conteudo: data.conteudo,
                    categoria: data.categoria.nome,
                    data: data.data
                }
            })
        }
        res.render('admin/postagens', {postagens: nPostagens.postagens})
    })
    .catch(erro=>{
        req.flash('error_msg', "Houve um erro ao listar as postagens: "+ erro)
        res.redirect('/admin')
    })
})

//rota para o formulario de cadastro de postagens
router.get('/postagens/add', eAdmin, (req, res)=>{
    //pega todas as categorias do banco e passa como parâmetro para a página addcategoria
    Categoria.find().then((categorias)=>{
        const nCategorias = {
            categorias: categorias.map(data =>{
                return{
                    _id: data._id,
                    nome:data.nome,
                    slug: data.slug,
                    date: data.date
                }
            })
        }
        res.render('admin/addpostagem',{categorias: nCategorias.categorias})
    }).catch((erro)=>{
        req.flash('error_msg', 'houve um erro ao carregar o formuário' + erro)
        res.redirect('/admin')
    })
})

//rota para salvar as postagens no banco de dados
router.post('/postagens/nova', eAdmin, (req, res)=>{
    //completar a validação #preguiça
    var erros = []
    if(req.body.categoria == '0'){
        erros.push({text: 'categoria inválida, registre uma categoria'})
    }

    if(erros.length > 0){
        res.render('admin/addpostagem', {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash('success_msg', 'Postagem salva com sucesso')
            res.redirect('/admin/postagens')
        }).catch((erro)=>{
            req.flash('error_msg', 'erro ao salvar a postagem' + erro)
            res.redirect('/admin/postagens')
        })
    }
})

//rota para editar as postagens
router.get('/postagens/edit/:id', eAdmin, (req, res)=>{
    Postagem.findOne({_id: req.params.id})
    .then((postagem)=>{
        const postagemAtual ={
            postagem:{
                _id: postagem._id,
                titulo: postagem.titulo,
                slug: postagem.slug,
                descricao: postagem.descricao,
                conteudo: postagem.conteudo,
                categoria:postagem.categoria,
                data: postagem.data
            }
        }

        //populado as categorias
        Categoria.find()
        .then((categorias)=>{
            const listaCategorias = {
                categorias: categorias.map(data =>{
                    return{
                        _id: data._id,
                        nome:data.nome,
                        slug: data.slug,
                        date: data.date
                    }
                })
            }
            //renderiza a página com as categorias e o post carregados
            res.render('admin/editPosts', {postagem: postagemAtual.postagem, categorias: listaCategorias.categorias})
        }).catch((erro)=>{
            req.flash('error_msg', 'houve um erro ao carregar o formuário' + erro)
            res.redirect('/admin')
        })
        
    })
    .catch((erro)=>{
        req.flash('error_msg', 'erro ao editar postagem: '+ erro)
        res.redirect('/admin')
    })
    
})

//rota para salvar postagens editadas
router.post('/postagens/edit', eAdmin, (req, res)=>{
    Postagem.findOne({_id: req.body.id})
    .then((postagem)=>{
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria
            postagem.data = req.body.data

            postagem.save().then(()=>{
                req.flash('success_msg', 'Postagem editada com sucesso')
                res.redirect('/admin/postagens')
            }).catch((erro)=>{
                req.flash('error_msg', 'houve um erro interno ao salvar a edição da postagem')
                res.redirect('/admin/postagens')
            })
    }).catch((erro)=>{
        req.flash('error_msg', 'houve umerro ao salvar a edição: '+ erro)
        res.redirect('/admin')
    })
})

//rota para excluir postagens
router.post('/postagens/delete', eAdmin, (req, res)=>{
    //deleteOne é o modo mais atualizado de apagar um dado com o mongoose
    Postagem.deleteOne({_id: req.body.id})
    .then(()=>{
        req.flash('success_msg', 'postagem excluída com sucesso')
        res.redirect('/admin/postagens')
    }).catch((erro)=>{
        req.flash('error_msg', 'erro ao excluir postagem: '+ erro)
        res.redirect('/admin/postagens')
    })
})

module.exports = router;