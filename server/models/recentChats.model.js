import mongoose from "mongoose";

const recentChatsSchema = new mongoose.Schema({
     recentChatsOf: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
     },
     recentChats: [
          {
               chatUser: { // add populate method here
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "user",
                    required: true,
               },
               lastMessage: {
                    type: String,
                    required: false,
                    default: ""
               },
               lastTalkDate: {
                    type: Date,
                    required: false,
                    default: Date.now
               }
          }]

}, { timestamps: true });


const RecentChats = mongoose.model("recentChats", recentChatsSchema);
export default RecentChats;
