import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModels.js";
import UsersChat from "../models/userChatModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
export const sendMessages = async (req, res) => {
    console.log("Message Sent");
    try {
        const { message, type } = req.body;
        const { userId: receiverId } = req.params;
        console.log(receiverId);
        if (receiverId === ":userId") return res.status(400).json({ error: "Receiver Id is Required" });
        const senderId = req.user._id;
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        })

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],

            })
        }
        const newMessage = new Message({
            senderId: senderId,
            receiverId: receiverId,
            message: message,
            messageType: type
        })
        if (newMessage) {
            conversation.messages.push(newMessage._id);

        }


        await Promise.all([conversation.save(), newMessage.save()])

        const receiverSocketId = getReceiverSocketId(receiverId);

        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);

        }
        const userChat = await UsersChat.findOneAndUpdate({
            senderId: senderId,
            allUsers: { $elemMatch: { users: receiverId } }
        }, {
            'allUsers.$.lastMessage': newMessage,
            'allUsers.$.totalUnreadMessage': 0,
            'allUsers.$.lastSeen': new Date()
        }, {
            returnOriginal: false
        });
        const reciverUserChat = await UsersChat.findOneAndUpdate({
            senderId: receiverId,
            allUsers: { $elemMatch: { users: senderId } }
        }, {
            'allUsers.$.lastMessage': newMessage,
            $inc: { 'allUsers.$.totalUnreadMessage': 1 },
            'allUsers.$.lastSeen': new Date()
        }, {
            returnOriginal: false
        });
        console.log(userChat);
        if (!userChat) {
            const userChatWithSenderId = await UsersChat.findOneAndUpdate(
                { senderId: senderId, },
                {
                    $push: {
                        allUsers: {
                            users: receiverId,
                            lastMessage: newMessage,
                            totalUnreadMessage: 0,
                            lastSeen: new Date()
                        }
                    }
                },
                { new: true } // Return the updated document
            );
            if (!userChatWithSenderId) {
                const newUserChat = UsersChat({
                    senderId: senderId,
                    allUsers: [{
                        users: receiverId,
                        lastMessage: newMessage,
                        totalUnreadMessage: 0,
                        lastSeen: new Date()
                    }]
                })
                await newUserChat.save();
            }

        }
        if (!reciverUserChat) {
            const userChatWithReciverId = await UsersChat.findOneAndUpdate(
                { senderId: receiverId, },
                {
                    $push: {
                        allUsers: {
                            users: senderId,
                            lastMessage: newMessage,
                            totalUnreadMessage: 1,
                            lastSeen: new Date()
                        }
                    }
                },
                { new: true } // Return the updated document
            );
            if (!userChatWithReciverId) {
                const newUserChat = UsersChat({
                    senderId: receiverId,
                    allUsers: [{
                        users: senderId,
                        lastMessage: newMessage,
                        totalUnreadMessage: 1,
                        lastSeen: new Date()
                    }]
                })
                await newUserChat.save();
            }

        }



        return res.status(201).send({
            message: newMessage,

        });


    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message)
        res.status(500).json({ error: "Internal Server Error", message: error.message })
    }
}

export const getMessages = async (req, res) => {
    try {
        const { userId: userToChatId } = req.params;
        const senderId = req.user._id;
        console.log(userToChatId + " " + senderId);
        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, userToChatId] },
        }).populate("messages");
        if (!conversation) return res.status(200).json([]);
        const reciverUserChat = await UsersChat.findOneAndUpdate({
            senderId: senderId,
            allUsers: { $elemMatch: { users: userToChatId } }
        }, {

            'allUsers.$.totalUnreadMessage': 0,

        }, {
            returnOriginal: false
        });
        return res.status(200).json(conversation.messages);


    } catch (error) {
        console.log("Error in getMessages controller: ", error.message)
        res.status(500).json({ error: "Internal Server Error" })

    }
}

export const getChatList = async (req, res) => {
    try {
        const userId = req.user._id;
        const userChatList = await UsersChat.find({ senderId: userId }).populate("allUsers.users allUsers.lastMessage");
        return res.status(200).json(userChatList);

    } catch (error) {
        console.log("Error in getChatList controller: ", error.message)
        res.status(500).json({ error: "Internal Server Error" })

    }
}