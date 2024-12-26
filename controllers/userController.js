import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwtTokenFunction from "../jwt/JwtToken.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from 'cloudinary';
export const Login = async (req, res) => 
  {
  const { email, password } = req.body;
  try 
  {

    if (!email || !password) 
    {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) 
    {
      return res.status(400).json({ error: "Invalid user credential!" });
    }

    if (user) 
    {
      jwtTokenFunction(user._id, user.name, user.email,user.photo, res); 
    }

    return res.status(200).json(
    {
      message: "User logged in successfully!",
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
    });
  } catch (error) 
  {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};
//for Register Logout
export const LogOut = async (req, res) => {
  try 
  {
    res.cookie('jwt', '', 
    { 
      httpOnly: true,
      expires: new Date(0),           
      secure: true,                
      sameSite: 'None',
      path: '/',    
    });
    return res.status(201).json({ message: "User Loged Out successfully!" });
  } 
  catch (error) 
  {
    console.log("error", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

export const SignUp = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  try {
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required!" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already registered!" });
    }

    // Upload photo to Cloudinary
    const file = req.files?.photo; // Optional chaining to avoid crashing if photo isn't provided
    let photoUrl = "";
    if (file) {
      const uploadResult = await cloudinary.uploader.upload(file.tempFilePath);
      photoUrl = uploadResult.url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      photo: photoUrl,
    });

    await newUser.save();
    return res.status(201).json({ message: "User registered successfully!", newUser });
  } catch (error) {
    console.error("SignUp error:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};
//for Getuser data
export const GetUserData = (req, res) => 
  {
    const token = req.cookies.jwt; 
    console.log("token is this:",token);
    if (!token) 
    {
      return res.status(401).json({ error: "No token provided" });
    } 
    jwt.verify(token, process.env.JwtTokenKEY, (err, decoded) => {
      try
      { 
        if (err) 
        {
          console.log("Token verification error:", err); 
          return res.status(403).json({ error: "Invalid token" });
        }
        // console.log("i am comming");
        // console.log("decoded data is :",decoded.userId);
        const userId = decoded.userId;
        const name = decoded.name;
        const email = decoded.email;
        const photo= decoded.photo;
        return res.json({ userId, name, email, photo });
      }catch(err)
      {
        console.log("i am comming");
        return res.status(403).json({ error: "Token varification error:" });
      }
    });
  };
  
