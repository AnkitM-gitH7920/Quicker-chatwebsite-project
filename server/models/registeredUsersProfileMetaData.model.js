import mongoose, { Schema } from "mongoose";


const userProfileDataSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    fullname: {
        type: String,
        required: false,
        default: null
    },
    contact: {
        type: String,
        required: true
    },
    avatarURL: {
        type: String, //Cloudinary URL
        required: false,
        default: null
    },
    profileBio: {
        type: String,
        required: false,
        default: null
    },
    isVerified: {
        type: Boolean,
        required: false,
        default: false
    }
}, { timestamps: true });


let UserProfileInfo = mongoose.model("UserProfileInfo", userProfileDataSchema);

export default UserProfileInfo;