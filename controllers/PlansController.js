const Plans = require("../models/Plans")
const TypesPlans = require("../models/TypesPlans")
const User = require("../models/User")
const mongoose = require("mongoose")

const Promise = require('bluebird');
mongoose.Promise = Promise;
//insert new plans
const insertPlans = async (req, res) => {
    //get body da requisição
    const { name, planId, paymentId } = req.body
    const reqUser = req.user
    //find User on mongoose(findOne)
    const user = await User.findById(reqUser.id)

    const plans = await Plans.findOne({userId:reqUser.id, active: true}).sort([["createdAt", -1]]).exec() 
    //console.log(plans)
    if(plans){
        res.status(402).json({errors:["Já existe plano ativo"]})
        return 
    }
    //create a Plans
    const newPlans = await Plans.create({
        name,
        planId,
        userId:user._id,
        active:true,
        paymentId,
        usageChamadasAPI: 0,
        usageUse: 0,
    })
    //if sucess
    if(!newPlans){
        res.status(422).json({errors:["Erro ao criar plano"]})
        return 
    }

    res.status(201).json(newPlans)
}
//delete a plans by ID
const deletePlans = async (req, res) =>{
    const {id} = req.params
    const reqUser  = req.user
    
    try {
        const plans = await Plans.findById(new mongoose.Types.ObjectId(id))
    
    //check is Plans exists
    if(!plans)
    {
        res.status(404).json({errors:["Plano não encontrada"]})
        return 
    }
    //check if Plans is user 
    if(!plans.userId.equals(reqUser._id))
    {
        res.status(422).json({errors:["Ocorreu um erro, tente novamente mais tarde."]})
        return 
    }

    await Plans.findByIdAndDelete(plans._id)
    
    res.status(200).json({id: plans._id, message: "Plano excluído com sucesso"})
    } catch (error) {
        console.log(error)
        res.status(404).json({errors:["Plano não encontrado"]})
        return
    }
    
}
//get all plans
const getAllPlans = async (req, res) =>{
    const plans = await Plans.find({}).sort([["createdAt", -1]]).exec()

    return res.status(200).json(plans)
}
//get user plans by id
const getUserPlans = async (req, res) => {
    const {id} = req.params
    const plans = await Plans.findOne({userId:id, active:true}).sort([["createdAt", -1]]).exec()
    return res.status(200).json(plans)
}
//get plans by id
const getPlansById = async (req, res) => {
    const {id} = req.params

    const plans = await Plans.findById(new mongoose.Types.ObjectId(id))

    if(!plans)
        return res.status(404).json({erros:["Plano não encontrado"]})

    return res.status(200).json(plans)
}
//update a plans
const updatePlans = async (req, res) => {
    const {id} = req.params
    const {planId, active, usageChamadasAPI,usageUso,paymentId} = req.body

    const reqUser = req.user

    const plans = await Plans.findById(id)

    if(!plans)
    {
         res.status(404)
         .json({erros:["Plano não encontrada"]})
         return
    }
    //check if plan is user 
    if(!plans.userId.equals(reqUser._id))
    {
        res.status(422)
        .json({errors:["Ocorreu um erro, tente novamente mais tarde."]})
        return 
    }
    if(paymentId)
    {
        plans.paymentId = paymentId
    }
    if(active)
    {
        plans.active = active
    }
    if(planId) 
    {
        plans.planId = planId
    }    
    if(usageChamadasAPI) 
    {
        plans.usageChamadasAPI = usageChamadasAPI
    }
    if(usageUso) 
    {
        plans.usageUso = usageUso
    }

    await plans.save()

     res.status(200).json({plans, message: "Plano atualizado com sucesso!"})
}
//update usage API
const updateUsageAPI = async (req,res) => {
    const {id} = req.params 
    
    const userPlans = await Plans.findOne({userId:id});
    const typesPlans = await TypesPlans.findById(userPlans.planId)

    if (!userPlans)
    {        
         return res.status(404).json({errors:["Plano não encontrado"]});
    }
    if(!typesPlans)
    {
        return res.status(402).json({errors:["Tipo de plano não encontrado!"]});
    }
    if(userPlans.usageChamadasAPI < typesPlans.limiteChamadasAPI){
        userPlans.usageChamadasAPI += 1
        userPlans.usageUse += 1
    }
    if(userPlans.usageChamadasAPI >= typesPlans.usageChamadasAPI)
        return res.status(402).json({errors:["Plano excedeu o limite de uso Diario!"]});

    await userPlans.save()

    res.status(200).json({userPlans, message: "Plano atualizado com sucesso!"})
    
}
//update usage API
const resetUsageAPI = async (req,res) => {

    const userPlans = await Plans.updateMany({usageChamadasAPI: 0})
    
    
    res.status(200).json({userPlans, message: "Planos atualizados com sucesso!"})
    
}
//update usage Total
const updateUsageUse = async (req,res) => {
    const {id} = req.params   
    
    const userPlans = await Plans.findOne({userId:id});
    const typesPlans = await TypesPlans.findById(userPlans.planId)

    if (!userPlans)
    {        
         return res.status(404).json({errors:["Plano não encontrado"]});
    }
    if(!typesPlans)
    {
        return res.status(402).json({errors:["Tipo de plano não encontrado!"]});
    }
    if(userPlans.usageUse < typesPlans.limiteUso)
        userPlans.usageUse += 1
    if(userPlans.usageUse >= typesPlans.limiteUso)
        return res.status(402).json({errors:["Plano excedeu o limite de uso!"]});


    await userPlans.save()

    res.status(200).json({userPlans, message: "Plano atualizado com sucesso!"})
    
}
module.exports = {
    insertPlans, deletePlans, getAllPlans, getUserPlans, getPlansById,updatePlans, updateUsageAPI, updateUsageUse, resetUsageAPI 
}