//carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
    //está recebendo a função que vem do express
const app = express()
//para funcionar as rotas devemos importar
const admin = require('./routes/admin')
const usuario = require('./routes/usuario')

//importando o módulo path
const path = require('path')
//importando ferramenta de sessões
const session = require('express-session')
const flash = require('connect-flash')

//carregando model de postagens
require('./models/Postagem')
const Postagem = mongoose.model('postagens')

//carregando model de categorias
require('./models/Categoria')
const Categoria = mongoose.model('categorias')

//carregando model de autenticação
const passport = require('passport')
require('./config/auth')(passport)

//carregando arquivo de configuração de escolha do BD, online ou local
const confDB = require('./config/db')

//configurações
    //sessões
    //1º esse
    app.use(session({
        secret:'cursonode', //chave para gerar uma sessão pode ser qualquer nome
        resave: true,
        saveUninitialized: true
    }))

    //configurando sessões do passport
    //2º esse
    app.use(passport.initialize())
    app.use(passport.session())

    //flash tem que ficar abaixo da sessão
    //3º esse
    app.use(flash())

    //middlewares
    //o app.use é uma middleware
    app.use((req, res, next)=>{
        //locals cria váriaveis globais no programa
        res.locals.success_msg= req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        //variavel global para o passport
        res.locals.error = req.flash('error')
        //variavel global que guarda informações do usuario
        //req.user é criado automaticamente pelo passport (caso n exista usuario logado o valor da variavel vai ser nulo)
        res.locals.user = req.user || null
        next()
    })

    //body-parser
    app.use(bodyParser.urlencoded({extended:true}))
    app.use(bodyParser.json())

    //handlebars
    app.engine('handlebars', handlebars({defaultLayout:'main'}))
    app.set('view engine', 'handlebars')

    //mongoose
    mongoose.Promise = global.Promise
    //mongoose.connect('mongodb://localhost/blogapp', { (versão sem bdmongo online)
    mongoose.connect(confDB.mongoURI, {
    //para não exibir erro de topologia antiga
    useUnifiedTopology: true, 
    useNewUrlParser: true}).then(()=>{
        console.log('mongoDB conectado')
    }).catch((err) =>{
        console.log('erro ao conectar: '+ err)
    })

//public
    //diz que a pasta que está guardando os arquivos estáticos é a pasta public
    app.use(express.static(path.join(__dirname, 'public')))    

//rotas
    //rota principal (home page)
    app.get('/',(req, res)=>{
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
                            data: data.data.toLocaleString('pt-BR')
                        }
                    })
                }
                res.render('index', {postagens: nPostagens.postagens})
        })
        .catch(erro=>{
            req.flash('error_msg', "Houve um erro ao listar as postagens: "+ erro)
            res.redirect('/404')
        })
    })

    //rota para abrir a postagem selecionada
    app.get('/postagem/:slug', (req, res)=>{
        Postagem.findOne({slug: req.params.slug})
        .then((postagem)=>{
            postagemAtual = {
                postagem:{
                    _id: postagem._id,
                    titulo: postagem.titulo,
                    slug: postagem.slug,
                    descricao: postagem.descricao,
                    conteudo: postagem.conteudo,
                    categoria: postagem.categoria.nome,
                    data: postagem.data.toLocaleString('pt-BR')
                }
            }
            //se houver uma postagem
            if(postagem){
                res.render('postagem/index',{postagem: postagemAtual.postagem})
            }else{
                req.flash('error_msg', "Houve um erro ao abrir a postagem: "+ erro)
                res.redirect('/')
            }
            

        }).catch((erro)=>{
            req.flash('error_msg', "Houve um erro ao abrir a postagem: "+ erro)
            res.redirect('/')
        })
    })

    //rota de listagem de categorias
    app.get('/categorias', (req, res)=>{
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
        
            res.render('categorias/index', {categorias: nCategorias.categorias})
        }).catch((erro)=>{
            req.flash('error_msg', 'Erro ao listar categorias')
            res.redirect('/categorias')
        })
    })

    //rota para abrir postagens relacionadas a ma categoria
    app.get('/categorias/:slug', (req, res)=>{
        Categoria.findOne({slug: req.params.slug}).then((categoria)=>{

            if(categoria){
                Postagem.find({categoria: categoria._id}).populate('categoria').then((postagens)=>{
                    const listaPostagens = {
                        postagens: postagens.map(data=>{
                            return{
                                _id: data._id,
                                titulo: data.titulo,
                                slug: data.slug,
                                descricao: data.descricao,
                                conteudo: data.conteudo,
                                categoria: data.categoria.nome,
                                data: data.data.toLocaleString('pt-BR')
                            }
                        })
                    }
                    res.render('categorias/postagens', {postagens: listaPostagens.postagens})
                    console.log(listaPostagens.postagens.categoria)

                }).catch((erro)=>{
                    req.flash('error_msg', 'Erro ao buscar por postagens relacionadas: '+ erro)
                    res.redirect('/categorias')
                })

            }else{
                req.flash('error_msg', 'Não a postagens relacionadas a catategoria: '+ erro)
                res.redirect('/categorias')
            }

        }).catch((erro)=>{
            req.flash('error_msg', 'Erro ao encontrar categoria')
            res.redirect('/categorias')
        })
    })

    //rota de erro de carregamento de página
    app.get('/404', (req, res)=>{
        res.send('Error 404, page not found')
    })


    //cria um grupo de rotas chamada admin onde podera utilizar todas as rotas do arquivo admin
    app.use('/admin', admin)
    //usa as rotas do usuario
    app.use('/usuario', usuario)

//outros
    //porta de conexão que o express vai utilizar (colocar sempre um valor alto) sempre no fial do documento
const PORT = process.env.PORT || 8081
app.listen(PORT, ()=>{
    console.log('servidor rodando')
})