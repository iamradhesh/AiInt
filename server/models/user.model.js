import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      index: true,
    },
    credits: {
      type: Number,
      default: 100,
      min: 0,
      max: 10000, // prevent overflow abuse
    },
  },
  {
    timestamps: true,
    strict: "throw", // 🔥 reject unknown fields
  }
);

export default mongoose.model("User", userSchema);