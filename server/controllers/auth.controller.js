import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const googleAuth = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ✅ SET the cookie (do NOT clear it)
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ Send only ONE response
    return res.status(200).json(user);

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: `Google auth error: ${error.message}`,
    });
  }
};

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    return res.status(500).json({
      message: `Logout error: ${error.message}`,
    });
  }
};
