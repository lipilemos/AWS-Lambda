const Configuration = require("../models/Configuration")
const User = require("../models/User")
const Plans = require("../models/Plans")
const mongoose = require("mongoose")
const { getUserPlans } = require("./PlansController")

const Promise = require('bluebird');
mongoose.Promise = Promise;
//insert new configuration
const insertConfiguration = async (req, res) => {
    //get body da requisição
    const {name,
        groupMessage,
        selfMessage,
        sharedMessage,
        translateMessage,
        saveMessage,
        onlyContactList,
        numberPhoneWhatsapp,
        sdkOpenIA,
        qrCode } = req.body

    const reqUser = req.user
    //find User on mongoose(findOne)
    const user = await User.findById(reqUser.id)
    //create a configuration
    const newConfiguration = await Configuration.create({
        name,
        groupMessage,
        selfMessage,
        sharedMessage,
        translateMessage,
        numberPhoneWhatsapp,
        onlyContactList,
        saveMessage,
        sdkOpenIA,
        qrCode,
        userId:user._id,
        userName: user.name
    })
    //if sucess
    if(!newConfiguration){
        res.status(422).json({errors:["Erro ao criar configuração"]})
        return 
    }

    res.status(201).json(newConfiguration)
}
//insert new configuration
const insertNewConfiguration = async (req, res) => {
    //get body da requisição
    const reqUser = req.user
    //find User on mongoose(findOne)
    const user = await User.findById(reqUser.id)
    //create a configuration
    const newConfiguration = await Configuration.create({
        name:"",
        groupMessage:false,
        selfMessage:false,
        sharedMessage:false,
        translateMessage:false,
        numberPhoneWhatsapp:"",
        onlyContactList:false,
        active:true,
        saveMessage:false,
        sdkOpenIA:"",
        qrCode:"",
        userId:user._id,
        isAuthenticate:false,
        userName: user.name
    })
    //if sucess
    if(!newConfiguration){
        res.status(422).json({errors:["Erro ao criar configuração"]})
        return 
    }

    res.status(201).json(newConfiguration)
}
//delete a configuration by ID
const deleteConfiguration = async (req, res) =>{
    const {id} = req.params
    const reqUser  = req.user
    
    try {
        const configuration = await Configuration.findById(new mongoose.Types.ObjectId(id))
    
    //check is configuration exists
    if(!configuration)
    {
        res.status(404).json({errors:["Configuração não encontrada"]})
        return 
    }
    //check if configuration is user 
    if(!configuration.userId.equals(reqUser._id))
    {
        res.status(422).json({errors:["Ocorreu um erro, tente novamente mais tarde."]})
        return 
    }

    await Configuration.findByIdAndDelete(configuration._id)
    
    res.status(200).json({id: configuration._id, message: "Configuração excluída com sucesso"})
    } catch (error) {
        res.status(404).json({errors:["Configuração não encontrada"]})
        return
    }
    
}
//get all configuration
const getAllConfiguration = async (req, res) =>{
    const configuration = await Configuration.find({active:true}).sort([["createdAt", -1]]).exec()
    return res.status(200).json(configuration)
}
//get user configuration by id
const getUserConfiguration = async (req, res) => {
    const {id} = req.params
    const configuration = await Configuration.findOne({userId:id}).sort([["createdAt", -1]]).exec()
    return res.status(200).json(configuration)
}
//get configuration by id
const getConfigurationByIdApp = async (req, res) => {
    const {id} = req.params

    const configuration = await Configuration.findById(new mongoose.Types.ObjectId(id))
    const plan = await Plans.findOne({userId:configuration.userId})

    if(!configuration)
        return res.status(404).json({errors:["Configuração não encontrada"]})
    if(plan)
        configuration.plan = plan
    return res.status(200).json({configuration, plan})
}
//get configuration by id
const getConfigurationById = async (req, res) => {
    const {id} = req.params

    const configuration = await Configuration.findById(new mongoose.Types.ObjectId(id))

    if(!configuration)
        return res.status(404).json({errors:["Configuração não encontrada"]})

    return res.status(200).json(configuration)
}
const getConfigurationByPhone = async (req, res) => {
    const {id} = req.params
    
    const configuration = await Configuration.findOne({numberPhoneWhatsapp:id})
    const plan = await Plans.findOne({userId:configuration.userId})

    if(!configuration)
        return res.status(404).json({errors:["Configuração não encontrada"]})
    if(plan)
        configuration.plan = plan
    return res.status(200).json({configuration, plan})
}
//update a configuration
const updateConfiguration = async (req, res) => {
    const {id} = req.params
    const {name,
        groupMessage,
        selfMessage,
        sharedMessage,
        translateMessage,
        saveMessage,
        onlyContactList,
        numberPhoneWhatsapp,
        sdkOpenIA,
        active,
        qrCode} = req.body

    const reqUser = req.user

    const configuration = await Configuration.findById(id)

    if(!configuration)
    {
         res.status(404)
         .json({errors:["Configuração não encontrada"]})
         return
    }    
    //check if photo is user 
    if(!configuration.userId.equals(reqUser._id))
    {
        res.status(422)
        .json({errors:["Ocorreu um erro, tente novamente mais tarde."]})
        return 
    }
    
    if(name) 
    {
        configuration.name = name
    }
    if(onlyContactList != configuration.onlyContactList)
    {
        configuration.onlyContactList = onlyContactList
    }
    if(groupMessage != configuration.groupMessage) 
    {
        configuration.groupMessage = groupMessage
    }
    if(selfMessage != configuration.selfMessage) 
    {
        configuration.selfMessage = selfMessage
    }
    if(sharedMessage != configuration.sharedMessage) 
    {
        configuration.sharedMessage = sharedMessage
    }
    if(translateMessage != configuration.translateMessage)
    {
        configuration.translateMessage = translateMessage
    }
    if(saveMessage != configuration.saveMessage)
    {
        configuration.saveMessage = saveMessage
    }
    if(numberPhoneWhatsapp) 
    {
        configuration.numberPhoneWhatsapp = numberPhoneWhatsapp
    }
    if(sdkOpenIA) 
    {
        configuration.sdkOpenIA = sdkOpenIA
    }
    if(qrCode) 
    {
        configuration.qrCode = qrCode
    }

    await configuration.save();
    
     res.status(200).json({configuration, message: "Configuração atualizada com sucesso!"})
}
const updateQrCode = async (req, res) =>{
    const {id} = req.params
    const {qrCode, userId, isAuthenticate} = req.body


    const configuration = await Configuration.findById(id)

    if(!configuration)
    {
         res.status(404)
         .json({errors:["Configuração não encontrada"]})
         return
    }    
    //check if photo is user 
    if(!configuration.userId.equals(userId))
    {
        res.status(422)
        .json({errors:["Ocorreu um erro, tente novamente mais tarde."]})
        return 
    }    
    if(qrCode) 
    {
        configuration.qrCode = qrCode
    }
    if(isAuthenticate != configuration.isAuthenticate) 
    {
        configuration.isAuthenticate = isAuthenticate
    }
    await configuration.save()

    res.status(200).json({configuration, message: "Configuração atualizada com sucesso!"})
}
//insert a contact
const insertListContacts = async (req,res) => {
    const {id} = req.params
    const {contact} = req.body    
    const configuration = await Configuration.findById(id);

    if (!configuration)
    {        
         return res.status(404).json({errors:["Configuração não encontrada"]});
    }
    if(configuration.listContact.includes(contact))
    {
        return res.status(422).json({errors:["Número ja cadastrado"]});
    }

    configuration.listContact.push(contact)
    await configuration.save()

    res.status(200).json({contact, message: "Contato salvo com sucesso!"})
    
}
//delete a contact
const deleteListContacts = async (req,res) => {    
     const {id} = req.params
     const {contact} = req.body
     const reqUser = req.user

     const configuration = await Configuration.findById(id);
     
     if (!configuration)
     {        
          return res.status(404).json({errors:["Configuração não encontrada"]});
     }

     if(configuration.listContact.includes(contact))
     {
         const index = configuration.listContact.indexOf(contact);
         if (index > -1) { // only splice array when item is found
            configuration.listContact.splice(index, 1); // 2nd parameter means remove one item only
             await configuration.save()
             
             res.status(200).json({contact:contact, message: "Contato excluido!"})
             return
         }        
     }

     res.status(422)
        .json({errors:["Ocorreu um erro, tente novamente mais tarde."]})
        return 
 }

module.exports = {
    insertNewConfiguration,insertConfiguration, deleteConfiguration, getAllConfiguration, getUserConfiguration, getConfigurationById,updateConfiguration, insertListContacts, deleteListContacts, getConfigurationByPhone, updateQrCode, getConfigurationByIdApp
}