const express = require("express")

const router = express.Router()

//controller
const {register, login, getCurrentUser, update, getUserById} = require("../controllers/UserController")

//middlewares
const validate = require("../middleware/handleValidation")
const {userCreateValidation, loginValidation, userUpdateValidation} = require("../middleware/userValidations")
const authGuard = require("../middleware/authGuard")
const { imageUpload } = require("../middleware/imageUpload")

//routes Users
//update
router.put("/", authGuard, userUpdateValidation(), validate, imageUpload.single("profileImage"), update) 
//create
router.post("/register",userCreateValidation(), validate, register)
// login
router.post("/login", loginValidation(), validate, login )
//getCurrentUser
router.get("/profile", authGuard, getCurrentUser)

//get user by ID
router.get("/:id", getUserById)

module.exports = router

