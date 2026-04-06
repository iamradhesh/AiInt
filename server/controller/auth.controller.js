import User from "../models//user.model.js";
import { genToken } from "../config/token.js";

export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and Email are required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email });
    }

    const token = await genToken(user._id);
    //console.log("Token genrated:",token)
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 4 * 24 * 60 * 60 * 1000,
    });

    //console.log("Token saved in cookie")

    res.status(200).json({
      message: "User authenticated successfully",
      user,
    });
  } catch (error) {
    console.error("Error in googleAuth:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Logout

export const logOut = async (req, res) => {
  try {
    await res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
    });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error in logOut:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
