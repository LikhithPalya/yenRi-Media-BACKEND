import express from "express"   
import {sendMessage, getMessage} from "../CONTROLLERS/message.controller.js"
import isAuthenticated from "../MIDDLEWARE/isAuthenticated.middleware.js"

const router = express.Router()

router.route("/sendmessage/:id").post(isAuthenticated, sendMessage)
router.route("/getmessage/:id").get(isAuthenticated, getMessage)

export default router