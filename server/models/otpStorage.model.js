import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const otpStorageSchema = new mongoose.Schema({
    userID: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    OTPHash: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

otpStorageSchema.methods.compareHashedOTP = async function (OTP) {
    const isEnteredOTPCorrect = await bcrypt.compare(OTP, this.OTPHash);
    return isEnteredOTPCorrect;
}

otpStorageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpStorage = mongoose.model("OtpStorage", otpStorageSchema);

export default OtpStorage;