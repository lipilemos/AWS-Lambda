const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const Promise = require('bluebird');
mongoose.Promise = Promise;

const jwtSecret = process.env.JWT_SECRET

const generateToken = (id) => {
    return jwt.sign({id},jwtSecret, {expiresIn:"7d"})
}

//register new user
const register = async (req, res) => {
    //get body da requisição
    const {name, email, password} = req.body
    //find User on mongoose(findOne)
    const user = await User.findOne({email})

    //if User exists
    if(user){
        res.status(422).json({errors:["E-mail já cadastrado"]})
        return
    }
    
    //generate hash + salt =(349u82h5r237rh223yt32h8t726245h2340gf572g2h938ghTg)
    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, salt)

    //create user on mongoose(create)
    const newUser = await User.create({
        name,
        email,
        password:passwordHash,
        active:true        
    })

    //if user created
    if(!newUser){
        res.status(422).json({errors:["Erro ao criar Usuário"]})
        return 
    }
    
    res.status(201).json({
        _id: newUser._id,
        token: generateToken(newUser._id)
    })
}
//login user
const login = async (req, res) => {

    //get body da requisição
    const {email, password} = req.body
    //find user by email on mongoose
    const user = await User.findOne({email})

    //if User not exists
    if(!user){
        res.status(404).json({errors:["Usuário não encontrado"]})
        return
    }

    //compare password decrypted
    if(!(await bcrypt.compare(password, user.password)))
    {
        res.status(422).json({errors:["Senha inválida"]})
        return
    }
    
    res.status(201).json({
        _id: user._id,
        profileImage:user.profileImage,
        token: generateToken(user._id),
        //getconfiguration
    })
}
//get current user 
const getCurrentUser = async (req, res) => {
    const user = req.user;

    res.status(200).json(user)
}
//update image 
const update = async (req, res) => {
    const {name, password, comment, cpf, active} = req.body
    let profileImage = null

    if(req.file)
        profileImage = req.file.filename
    console.log(req.body)
    const reqUser = req.user
    const user = await User.findById(new mongoose.Types.ObjectId(reqUser._id)).select("-password")

    if(name)
    user.name = name

    if(password){
        const salt = await bcrypt.genSalt()
        const passwordHash = await bcrypt.hash(password, salt)
        user.password = passwordHash
    }
    if(cpf)
        user.cpf = cpf

    if(active)
        user.active = active

    if(profileImage)
        user.profileImage = profileImage
    
    if(comment)
    user.comment = comment

    await user.save()

    res.status(200).json(user)
}
//get user by ID
const getUserById = async (req, res) =>{
    const {id} = req.params    
    try {
        const user = await User.findById(new mongoose.Types.ObjectId(id)).select("-password")
        
        //if user exists
        if(!user){
            res.status(404).json({errors:["Usuário não encontrado"]})
            return 
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(404).json({errors:["Usuário não encontrado"]})
    }        
}
module.exports = {
    register,login, getCurrentUser,update, getUserById
}