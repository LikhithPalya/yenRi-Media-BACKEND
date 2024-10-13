import mongoose, { Schema } from "mongoose"

const userSchema  = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String,
        default:'',
    },
    bio:{
        type:String,
        default:'',
    },
    gender:{
        type: String,
        enum:['male','female']
    },
    
    followers:[{
        type: mongoose.Schema.Types.ObjectId, //later on we can get the use id using aggregation pipelines 
        reference: "User"
        }],
    following:[{
        type: mongoose.Schema.Types.ObjectId,
        reference: "User"
    }],
    posts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    bookmarks:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts"
    }]
    
},{timestamps:true})

export const User = mongoose.model("User", userSchema) 