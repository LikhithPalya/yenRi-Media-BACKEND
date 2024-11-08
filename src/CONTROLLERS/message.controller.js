// FOR CHATTING BTW USERS

import { ApiError } from "../UTILS/ApiError.js";
import { ApiResponse } from "../UTILS/ApiResponse.js";
import {Conversation} from '../MODELS/conversation.model.js'
import {Message} from '../MODELS/message.model.js'

export const sendMessage = async (req,res)=>{
    try {
        const senderId = req.id //LOGGED IN AND AUTHENTICATED
        const receiverId = req.params.id
        const {message} = req.body
        const conversation = await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        }) //TO GET ALL THE CONVERSATIONS THATS HAPPENED

        // NOW START A CONVERSATION IF NOT YET STARTED
        if(!conversation){
           conversation = await Conversation.create({
                participants:[senderId,receiverId]
            })
        }
        const newMessage = await Message.create({
            senderId, receiverId, message
        })
        if (newMessage) conversation.message.push(newMessage._id)
        //SAVING NEW MESSAGE AND CONVERSATION individually is like "await message.save()" and stuff but promise.all() saves that verbosity
        await Promise.all([conversation.save(), message.save()])

        //IMPLEMENT SOCKET IO FOR REAL TIME DATA TRANSFER 1-1

        return res.status(201).json(new ApiResponse(201, newMessage, "Message sent successfully"))
    } catch (error) {
        throw new ApiError(400, "Message couldn't be sent")
    }
}

export const getMessage = async (req,res)=>{
    try {
        const senderId = req.id
        const receiverId = req.params.id
        const conversation = await Conversation.find({
            participants:{$all:[senderId, receiverId]}
        }) 
        if(!conversation) {
            return res   
            .status(200)
            .json(new ApiResponse(200, {},"no conversation found so its a new conversation!"))
        }
        const conversationMessages = conversation.map(conversation => conversation?.messages);
        return res.status(200).json(
            new ApiResponse(200, conversationMessages, "Conversations found!")
        )
    } catch (error) {
        console.log("the error is=" +error);
        
        throw new ApiError(404, "error getting messages")
    }
} 

