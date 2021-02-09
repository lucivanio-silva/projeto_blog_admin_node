//verifica se a aplicação está rodando no heroku ou localmente para definir a forma de rodar
if(process.env.NODE_ENV == 'production'){
    //se a aplicação estiver em ambiente de produção
    module.exports = {mongoURI: 'mongodb+srv://admin:65626198@blogapp-fm4fu.mongodb.net/test?retryWrites=true&w=majority'}
}else{
    //ta repetido por que ele está vindo para o else não fazer esse arquivo no proximo projeto
    module.exports = {mongoURI: 'mongodb+srv://admin:65626198@blogapp-fm4fu.mongodb.net/test?retryWrites=true&w=majority'}
}