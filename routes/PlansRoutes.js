const express = require("express")
const router = express.Router()

//controller
const {insertPlans, deletePlans, getAllPlans, getUserPlans, getPlansById,updatePlans, updateUsageAPI, updateUsageUse, resetUsageAPI} = require("../controllers/PlansController")
const {getTypesPlansById, getAllTypesPlans} = require("../controllers/TypesPlansController")
//middlewares
const validate = require("../middleware/handleValidation")
const authGuard = require("../middleware/authGuard")

//get All Types Plans
router.get("/types", getAllTypesPlans)
//routes plans
//create
router.post("/",authGuard, validate, insertPlans)
// delete
router.delete("/:id",authGuard,deletePlans )
//get all plans
router.get("/", authGuard, getAllPlans)
//get User plans by id
router.get("/user/:id", authGuard, getUserPlans)
//get plans by ID
router.get("/:id", authGuard, getPlansById)

//update a planss
router.put("/reset", resetUsageAPI)
//update a plans
router.put("/:id", authGuard, validate, updatePlans)
//update a plans
router.put("/usageAPI/:id", updateUsageAPI)

//get Types Plans by id
router.get("/types/:id", getTypesPlansById)

module.exports = router

