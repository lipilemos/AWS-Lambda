const {body} = require("express-validator")

const configurationInsertValidation = () => {
    return [
        body("name")
        .optional()
        .isLength({min:3})
        .withMessage("O nome deve ter no mínimo 3 caracteres."), 
        body("groupMessage")
        .isBoolean()
        .withMessage("A configuração de mensagens de grupo deve estar configurada"),        
        body("selfMessage")
        .isBoolean()
        .withMessage("A configuração de mensagens próprias deve estar configurada"),
        body("sharedMessage")
        .isBoolean()        
        .withMessage("A configuração de mensagens encaminhadas deve estar configurada"),
        body("onlyContactList")
        .isBoolean()
        .withMessage("A configuração de mensagens exclusivas deve estar configurada"),
        body("translateMessage")
        .isBoolean()        
        .withMessage("A configuração de mensagens traduzidas deve estar configurada"),
        body("saveMessage")
        .isBoolean()        
        .withMessage("A configuração para salvar mensagens deve estar configurada")
        
    ]
}
const configurationUpdateValidation = () => {       
    return [
        body("name")
        .optional()
        .isLength({min:3})
        .withMessage("O nome deve ter no mínimo 3 caracteres."), 
        body("numberPhoneWhatsapp")
        .isString()
        .withMessage("O número de telefône whatsapp deve estar configurada")        
        .isLength({min:3})
        .withMessage("O número de telefône whatsapp deve ter no minimo 11 caracteres"),
        body("groupMessage")
        .optional(),
        body("selfMessage")
        .optional(),
        body("sharedMessage")
        .optional(),
        body("onlyContactList")
        .optional(),
        body("translateMessage")
        .optional(),
        body("saveMessage")
        .optional(),
        body("sdkOpenIA")
        .optional()
        .isString()
        .withMessage("O sdk OpenIA deve estar configurado"),
        body("qrCode")
        .optional()
        .isString()
        .withMessage("O QRCode deve estar configurado"),               
    ]
}
const listContactUpdateValidation = () => {       
    return [
        body("contact")
        .isString()
        .isLength({min:10})
        .withMessage("O número deve ter no mínimo 10 caracteres.")
        .isLength({max:11})
        .withMessage("O número deve ter no máximo 11 caracteres.")
    ]
}

module.exports = { configurationInsertValidation, configurationUpdateValidation,listContactUpdateValidation }