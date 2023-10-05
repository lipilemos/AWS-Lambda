const {body} = require("express-validator");

const userCreateValidation = () => {
    return [
        body("name")
        .isString()
        .withMessage("O campo nome é obrigatório")
        .isLength({min:3})
        .withMessage("O nome deve ter no mínimo 3 caracteres"),
        body("email")
        .isString()
        .withMessage("O campo e-mail é obrigatório")
        .isEmail()
        .withMessage("Insira um e-mail válido"),
        body("password")
        .isString()
        .withMessage("A senha é obrigatório")
        .isLength({min:5})
        .withMessage("A senha deve ter no mínimo 5 caracteres."),
        body("confirmPassword")
        .isString()
        .withMessage("A confirmação de senha é obrigatório")
        .custom((value, {req}) => {
            if(value != req.body.password){
                throw new Error("As senhas não são iguais")
            }
            return true;
        })        
    ]
}

const loginValidation = () => {
    return [
        body("email")
        .isString()
        .withMessage("O campo e-mail é obrigatório")
        .isEmail()
        .withMessage("Insira um e-mail válido"),
        body("password")
        .isString()
        .withMessage("A senha é obrigatório")
    ]
}
const userUpdateValidation = () =>{
return [
    body("name")
    .optional()
    .isLength({min:3})
    .withMessage("O nome deve ter no mínimo 3 caracteres."),    
    body("password")
    .optional()
    .isLength({min:5})
    .withMessage("A senha precisa ter no mínimo 5 caracteres."),
    body("comment")
    .optional()
    .isLength({min:3})
    .withMessage("O comentário deve ter no mínimo 3 caracteres."),    
    body("cpf")
    .optional()
    .isLength({min:11})
    .withMessage("O CPF deve ter no mínimo 11 caracteres.")     
    ]
}
module.exports = {
    userCreateValidation, loginValidation, userUpdateValidation,
}