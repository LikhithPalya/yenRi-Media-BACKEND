import {ApiError} from "../UTILS/ApiError.js"
import {Post} from "../MODELS/post.model.js"
import {User} from "../MODELS/user.model.js"
import sharp from "sharp"


export const addNewPost = async(req,res)=>{
    try {
        const {caption} = req.body
        const {image} = req.file
        const authorId = req.id //  TO FIND OWNER OF POST

        if(!image) throw new ApiError(400, "image required")

        //IMAGE UPLOAD
        const optimisedImageBuffer = await sharp(image.buffer)
            .resize({width:800, height:800, fit:'inside'})
            .toFormat('jpeg', {quality:80})
            .toBuffer();
        
            // converting the buffer to datauri
        const fileUri = `data: image/jpeg; base64, ${optimisedImageBuffer.toString('base64')}`
        console.log(fileUri);

        const cloudResponse = await cloudinary.uploader.upload(fileUri)
        const post = await Post.create({
            caption,
            image:cloudResponse.secure_url,
            author: authorId,
        })


    } catch (error) {
        console.log("Error is "+error);
        throw new ApiError(404, "cant find post")
    }
}