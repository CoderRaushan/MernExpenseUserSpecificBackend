
import mongoose from "mongoose";
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
    },
    photo: {
      type: String, // Store the Cloudinary URL here
      required: false,
    },
  },
  { timestamps: true }
); //createdAt & updatedAt
const User = mongoose.model("User", userSchema);
export default User;
