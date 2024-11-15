import { ApiError } from "../UTILS/ApiError.js";
import { User } from "../MODELS/user.model.js";
import bcrypt from "bcryptjs"
import {ApiResponse} from "../UTILS/ApiResponse.js"
import jwt from "jsonwebtoken"
import cloudinary from "../UTILS/cloudinary.js"
import getDataUri from "../UTILS/dataUri.js";
import dotenv from "dotenv";
dotenv.config()
import {Post} from "../MODELS/post.model.js"



export const register = async (req,res)=>{
    try {
        console.log(req.body);
        const {username, email,password} = req.body
        

        if(!username || !email || !password) {
            console.log("Enter all details completely");
            throw new ApiError(400,"enter proper email id")
        }
            const user = await User.findOne({email})
            if(user){
                throw new ApiError(401, "Email already exists, try registering with a new email")
            }
            console.log("user is created");

            const hashedPassword = await bcrypt.hash(password,10)
            const createdUser=  await User.create({
                username,
                email,
                password:hashedPassword
            })
            return res
            .status(201)
            .json(new ApiResponse(200,createdUser, "User successfully registered"))
    } catch (error) {
        console.log("error is "+ error);
        throw new ApiError(500, `error is ${error}`)
    }
} 

export const login = async (req,res)=>{
    try {
        const {email,password} = req.body

        if(!email || !password) {
            throw new ApiError(401, "Enter all details completely")
        }
        
        let user = await User.findOne({email}).populate("posts")  // we can use map fn as well but this is more efficient as we are only using one MONGODB call
        if(!user) {throw new ApiError(401, "Incorrect email")}
        
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if(!isPasswordMatch) throw new ApiError(401, "Wrong password")
            console.log("email passowrd verified");

        //IF EMAIL&&PASSWORD IS CORRECT GENERATE TOKENS FOR AUTH
        const token = jwt.sign({userId: user._id}, process.env.SECRET_KEY,{expiresIn: '1d'} )
        
        // POPULATE EACH USER WITH THE POSTS
        user = {
            _id:user._id, // _id is the way the mongodb stores the details"_id"
            username:user.username,
            email:user.email,
            profilePicture:user.profilePicture,
            bio:user.bio,
            followers: user.followers,
            following:user.following,
            posts:user.posts
        }
        console.log("Successfullly loggen in, your token is "+token);
        return res
        .cookie("token", token, {httpOnly:true, sasameSitemeSite:'strict', maxAge: 1*24*60*60*1000}) //for security purposes
            // httpOnly:true: This flag makes the cookie inaccessible to JavaScript on the client-side, which helps prevent XSS (Cross-Site Scripting) attacks.
            // sameSite:'strict': This flag helps prevent CSRF (Cross-Site Request Forgery) attacks by only allowing the cookie to be sent with requests from the same origin (i.e., the same domain, protocol, and port).
            // maxAge: 1*24*60*60*1000: This sets the maximum age of the cookie in milliseconds. In this case, the cookie will expire in 1 day (24 hours).
        .json(
            new ApiResponse (200, user, "user successfully logged in")
        )

    } catch (error) {
        console.log("error is "+ error);
        throw new ApiError (404, "User not found")
    }
}
export const logout = async (_, res) => {
    try {
        res.cookie("token", "", { maxAge: 0, httpOnly: true });
        // Ensure the response is sent back properly
        return res.status(200).json(new ApiResponse(200, {}, "You are successfully logged out"));
    } catch (error) {
        console.log("Logout error:", error);
        return res.status(400).json(new ApiResponse(400, {}, "Error logging out!"));
    }
};


export const getProfile = async(req,res)=>{
        try {
            const userId = req.params.id;
            let user = await User.findById(userId).select("-password") 
            console.log("found the user deets: "+ user);
            return res.status(200).json(
            new ApiResponse(200, user,"User successfully fetched"))

        } catch (error) {
            console.log(error);
            throw new ApiError(401, "Error getting profile!")
        }
}



export const editProfile = async(req,res)=>{
    // WE CAN ONLY EDIT THE USER IF ITS LOGGED IN AND CANNOT EDIT ANY OTHER USER
    console.log("Function called");
     try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        };
        if (bio) user.bio = bio;
        console.log("bio updated");
        if (gender) user.gender = gender;
        console.log("gender updated");
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
        throw new ApiError(401, "Error updating profile!")
    }
}

export const getSuggestedUsers = async (req,res)=>{
    try {
        const suggestedUsers = await User.find({_id:{$ne:req.id}}).select("-password")
        // "$ne" is used to neglet the current user and find everyone else except for the owner
        if(!suggestedUsers){
            throw new ApiError(404, "We cannot find such a user")
        }
        res.status(200)
        .json(
            new ApiResponse (200, suggestedUsers, "Found them!")
        )
    } catch (error) {
        throw new ApiError(404, "User not found")
        
    }
}


export const followOrUnfollow = async(req,res)=>{
    try {
        const followKarneWala = req.id //the person who is logged in and is gonna follow (owner's id)
        const jiskoFollowKarunga = req.params.id // the other's id

        if(followKarneWala === thePersonToFollow){
            throw new ApiError(400, "You cannot follow/unfollow yourself")
        }

        const user = await User.findById(followKarneWala)
        const targetUser = await User.findById(jiskoFollowKarunga)

        if(!user || !targetUser) throw new ApiError(400, "User not found")
            
        // TO CHECK IF TO FOLLOW OR UNFOLLOW
        const isFollowing = user.following.includes(jiskoFollowKarunga) //RETURNS A BOOLEAN IF THE USER IS FOLLOWING THE OTHER USER
        if(isFollowing == true) {
            //UNFOLLOW LOGIC
            await Promise.all([
                User.updateOne({_id:followKarneWala}, {$pull:{following:jiskoFollowKarunga}}), //Updating owner
                User.updateOne({_id:jiskoFollowKarunga}, {$pull:{following:followKarneWala}}) 
            ])
            return res.status(200)
            .json(
                new ApiResponse(200, {},"Unfollowed successfully")
            )

        } else{
            await Promise.all([
                User.updateOne({_id:followKarneWala}, {$push:{following:jiskoFollowKarunga}}), //Updating owner
                User.updateOne({_id:jiskoFollowKarunga}, {$push:{following:followKarneWala}}) 
            ])
            return res.status(200)
            .json(
                new ApiResponse(200, {},"Followed successfully")
            )
        }      
        
    } catch (error) {
        throw new ApiError(401, "Something went wrong")
    }
}