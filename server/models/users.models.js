import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
     email: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
          unique: true
     },
     password: {
          type: String,
          required: function () {
               return this.provider === "local" ? true : false
          },
     },
     contact: {
          type: String,
          required: false
     },
     fullName: {
          type: String,
          required: false,
     },
     provider: {
          type: String,
          enum: ["local", "google"],
          default: "local"
     },
     loggedOffOn: {
          type: Date,
          required: false,
          default: null
     },
     refreshToken: {
          type: String,
          required: false,
          default: null
     }
}, { timestamps: true });

userSchema.pre("save", async function () {
     if (this.isModified("password")) {
          this.password = await bcrypt.hash(this.password, 10);
          return;
     }
     return;
})

userSchema.methods.compareEncryptedPassword = async function (password) {
     if (this.provider === "google") return false;
     return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
     return jwt.sign({
          userID: this._id,
          purpose: "ACCESS"
     }, process.env.JWT_ACCESSTOKEN_SECRET,
          { expiresIn: "45m" }
     )
}

userSchema.methods.generateRefreshToken = function () {
     return jwt.sign({
          userID: this._id,
          purpose: "ACCESS"
     }, process.env.JWT_REFRESHTOKEN_SECRET,
          { expiresIn: "90d" }
     )
}

let User = mongoose.model("user", userSchema);

export default User;
