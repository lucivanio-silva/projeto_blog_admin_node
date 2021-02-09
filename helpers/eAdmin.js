//helper para verficar se um usuário está autenticado e se ele é um admin

module.exports = {
    eAdmin: (req, res, next)=>{
        //fuunção gerada pelo passport, serve para identificar se um usuário está logado ou não e se ele é administrador
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            //se o usuário estiver autenticado e for admin a navegação passa
            return next();
        }
        //se o usuario não está autenticado
        req.flash('error_msg', 'Você precisa ser um admin')
        res.redirect('/')
    }
}