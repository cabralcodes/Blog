import Post from "../models/Postagem.js";

async function podeEditarPost(req, res, next) {
    try {
        const post = await Postagem.findById(req.params.id);

        if (!post) {
            req.flash("error_msg", "Post não encontrado");
            return res.redirect("/");
        }

        //  Verifica se é dono OU admin
        if (
            post.usuario.toString() === req.user._id.toString() ||
            req.user.eAdmin == 1
        ) {
            return next();
        }

        req.flash("error_msg", "Você não tem permissão");
        res.redirect("/");

    } catch (err) {
        req.flash("error_msg", "Erro interno");
        res.redirect("/");
    }
}
export default podeEditarPost;
