import express from "express"
import {editProfile,followOrUnfollow,getProfile, getSuggestedUsers, login, logout, register} from "../CONTROLLERS/user.controller.js"
import isAuthenticated from "../MIDDLEWARE/isAuthenticated.middleware.js"
import upload from "../MIDDLEWARE/multer.middleware.js"

const router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/:id/profile').get(isAuthenticated, getProfile)
router.route('/profile/edit').post(isAuthenticated,upload.single('profilePicture'), editProfile)
router.route('/suggested-user').get(isAuthenticated,getSuggestedUsers)
router.route('/followorunfollow/:id').post(isAuthenticated,followOrUnfollow)

export default router