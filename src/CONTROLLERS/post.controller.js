import {ApiError} from "../UTILS/ApiError.js"
import {Post} from "../MODELS/post.model.js"
import {User} from "../MODELS/user.model.js"
import {Comment} from '../MODELS/comment.model.js'
import sharp from "sharp"
import { ApiResponse } from "../UTILS/ApiResponse.js"


export const addNewPost = async(req,res)=>{
    try {
        const {caption} = req.body
        const {image} = req.file
        const authorId = req.id //  TO FIND OWNER OF POST

        if(!image) throw new ApiError(400, "image required")

        //IMAGE UPLOAD USING SHARP FOR IMAGE RESOLUTION OPTIMIZATION BECAUSE MULTER UPLOADS AT THE ORG QUALITY WHICH WILL BECOME HEAVY FOR OUR DB AS WELL AS SPEED OF UPLOAD MYNOT BE HIGH 
        const optimisedImageBuffer = await sharp(image.buffer)
            .resize({width:800, height:800, fit:'inside'})
            .toFormat('jpeg', {quality:80})
            .toBuffer();
        
            // This code snippet converts the optimized image buffer to a base64-encoded string and creates a data URI, which is a string that represents the image data in a format that can be used directly in a web application.
        const fileUri = `data: image/jpeg; base64,${optimisedImageBuffer.toString('base64')}`
        console.log(fileUri);


        const cloudResponse = await cloudinary.uploader.upload(fileUri)
        const post = await Post.create({
            caption,
            image:cloudResponse.secure_url,
            author: authorId,
        })

        const user = await User.findById(authorId)
        if(!user) throw new ApiError(404, "cant find user")
        user.posts.push(post._id);
        await user.save();

        await post.populate({path:'author', select:'-password'})

        return res 
            .status(200)
            .json(new ApiResponse(200, post,"Post successfully created!"))


    } catch (error) {
        console.log("Error is "+error);
        throw new ApiError(404, "cant find post")
    }
}

export const getAllPosts = async(req,res)=>{ //to get all posts and display on the main homepage
    try {
        const post = await Post.find().sort({createdAt:-1}).populate({path:"author", select:'username, profilePicture'}).populate(
            {
                path:'comments',
                sort:{createdAt:-1},
                populate:{ //to get author info in the comments as well
                    path: 'author',
                    select:'username,profilePicture'
                }
            }
        )
        return res 
            .status(200)
            .json(new ApiResponse(200, post,"Posts successfully fetched!"))
        
    } catch (error) {
        console.log("Error is "+error);
        throw new ApiError(404, "cant find posts")
    }
}

export const getUserPost = async(req,res)=>{//to get all posts and display on the main profile page
    try {
        const authorId = req.id
        const posts = await Post.find({author:authorId}).sort({createdAt :-1}).populate({
            path:'author',
            select:'username,profilePicture',
        }).populate(
            {
                path:'comments',
                sort:{createdAt:-1},
                populate:{ //to get author info in the comments as well
                    path: 'author',
                    select:'username,profilePicture'
                }
            }
        )
        return res 
        .status(200)
        .json(new ApiResponse(200, post,"Author's posts successfully fetched!"))
    } catch (error) {
        console.log("Error is "+error);
        throw new ApiError(404, "cant find posts")
    }
}

export const likePost = async(req,res)=>{
    try {
        const likeKarneWalaUser = req.id
        const postId = req.params.id
        const post = await Post.findById(postId)
        if(!post)  throw new ApiError(404, "cant find post")
        
        //LIKE LOGIC
        await post.updateOne({$addToSet:{likes:likeKarneWalaUser}})
        await post.save()

        //TODO : IMPLEMENT SOCKET IO FOR REALTIME NOTIFICATION


    return res.status(200).json(new ApiResponse(200, post, "Post successfully liked!"))

    } catch (error) {
        console.log("Error is "+error);
        throw new ApiError(404, "cant find liked posts")
    }
}

export const dislikePost = async(req,res)=>{
    try {
        const likeKarneWalaUser = req.id
        const postId = req.params.id
        const post = await Post.findById(postId)
        if(!post)  throw new ApiError(404, "cant find post")
        
        //LIKE LOGIC
        await post.updateOne({$pull:{likes:likeKarneWalaUser}})
        await post.save()

        //TODO : IMPLEMENT SOCKET IO FOR REALTIME NOTIFICATION

        return res.status(200).json(new ApiResponse(200, post, "Post successfully disliked! YOU ARE A HATER!!"))


    } catch (error) {
        console.log("Error is "+error);
        throw new ApiError(404, "cant find disliked posts")
    }
}

export const addComment = async (req,res)=>{
    try {
        const postId = req.params.id
        const commentKarneWalaId = req.id

        const {text} = req.body
        const post = await Post.findById(postId)
        if(!text) throw new ApiError(404, "text is required");
        
        const comment = await Comment.create({
            text,
            author:commentKarneWalaId,
            post:postId
        }).populate({
            path:'author',
            select:'username, profilePicture'
        })
       post.comments.push(comment._id)
       await post.save()
       return res.status(201).json(new ApiResponse(201, comment, "comment added succesfully!"))
    } catch (error) {
        console.log("Error is "+error);
        throw new ApiError(404, "cant add comment")
    }   
}

export const getPostComment = async (req,res)=>{
    try {
        const postId = req.params.id
        const comments = await Comment.find({post:postId}).populate('author', 'username, profilePicture')
        
        if(!comments) throw new ApiError(404, "comments not found!");

        return res.status(200).json( new ApiResponse(200, comments, "Comments successfully fetched!"))

    } catch (error) {
        console.log("Error is "+error);
        throw new ApiError(404, "cant get comment")
    }
}

export const deletePost = async(req,res)=>{
    try {
        const postId = req.params.id
        const authorId = req.id
        const post = await Post.findById(postId)
        if(!post) throw new ApiError(404, "Post not found!")
        
        //CHECK IF THE LOGGEDIN USER IS THE POST'S OWNER, SO ONLY THE OWNER CAN DELETE THE POST
        if(post.author.toString()!=authorId) throw new ApiError(403, "Unauthorised to perfom the action!")
        await Post.findByIdAndDelete(postId)
        //REMOVE THE POST IN THE USER MODEL AS WELL BECAUSE WHILE DISPLAYING, WE WILL HAVE USERID BUT NO POST therefore REMOVING ID FROM USER AS WELL

        let user = await User.findById(authorId)
        user.posts = user.posts.filter(id == id.toString() !=postId) //USER.POSTS IS AN ARRAY
        await user.save()

        //DELETING THE POST'S COMMENTS
        await Comment.deleteMany({post:postId})

        return res.status(200)
        .json(200, {},"Post and comments of the post successfully deleted")
    } catch (error) {
        console.log("Error is "+error);
        throw new ApiError(404, "Something went wrong, can't delete post!")
    }
}

export const bookmarkPost = async(req,res)=>{
    try {
        //2 THINGS TO BE KEPT IN MIND, WHAT ARE YOU BOOKMARKING AND WHO IS DOING IT
        const postId = req.params.id
        const authorId = req.id
        const post = await Post.findById(postId)
        if(!post) throw new ApiError(404, "Post not found!");
        const user = await User.findById(authorId)
        if(!user.bookmarks.includes(post._id)){
            //ALREADY BOOKMARK EXISTS, remove from bookmark
            await user.updateOne({$pull:{bookmarks:post._id}})
            await user.save()
            return res.status(200)
            .json(new ApiResponse(200, {},"Unbookmarked successfully"))
        }else{
            // DO BOOKMARK
            await user.updateOne({$addToSet:{bookmarks:post._id}})
            await user.save()
            return res.status(200)
            .json(new ApiResponse(200, {}," Post bookmarked successfully"))
        }
    } catch (error) {
        console.log("Error is "+error);
        throw new ApiError(404, "Something went wrong, can't bookmark post!")
    }
}