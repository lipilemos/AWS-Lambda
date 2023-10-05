const express = require("express")
const router = express.Router()

//controller
const {
    insertConfiguration, 
    deleteConfiguration, 
    getAllConfiguration, 
    getConfigurationByIdApp,
    updateQrCode,
    getUserConfiguration,
    getConfigurationById, 
    updateConfiguration,    
    insertListContacts,
    deleteListContacts,
    insertNewConfiguration,
    getConfigurationByPhone
} = require("../controllers/ConfigurationController")

//middlewares
const {configurationInsertValidation, configurationUpdateValidation, listContactUpdateValidation} = require("../middleware/configurationValidation")
const validate = require("../middleware/handleValidation")
const authGuard = require("../middleware/authGuard")

//routes configurations
router.get("/getAll", getAllConfiguration)

//create
router.post("/",authGuard, validate, insertNewConfiguration)
// delete
router.delete("/:id",authGuard,deleteConfiguration)
//get all configuration
router.get("/", authGuard, getAllConfiguration)
//get User configuration by id
router.get("/user/:id", authGuard, getUserConfiguration)
//search configuration by query
//router.get("/search", authGuard, searchImage)
//get configuration by ID
router.get("/:id", authGuard, getConfigurationById)
//get configuration by ID
router.get("/app/:id", getConfigurationByIdApp)
//get configuration by ID
router.get("/getByPhone/:id", getConfigurationByPhone)

//add listContact
router.put("/addcontacts/:id", authGuard, listContactUpdateValidation(), validate, insertListContacts)
//delete listContact
router.put("/deletecontacts/:id", authGuard, validate, deleteListContacts)
//add qrCode via Application
router.put("/addQrCode/:id", updateQrCode)

//update a configuration
router.put("/:id", authGuard, configurationUpdateValidation(), validate, updateConfiguration)

module.exports = router

