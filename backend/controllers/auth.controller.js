import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import generateTokenAndSetCookie from '../utils/generateToken.js';

export const signup = async (req, res) => {
  try {

    // Validate input
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all fields' });
    }

    // Check if user already exists in MongoDB
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    
    if (newUser) {
      await newUser.save();
      // Generate JWT token and set it in a cookie
      generateTokenAndSetCookie(newUser._id, res);

      // Respond with user info excluding password and token
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }

  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email in MongoDB
    const user = await User.findOne({ email });

    // Check if user exists and password matches, if not send error response
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token and set it in a cookie
    generateTokenAndSetCookie(user._id, res);

    // Respond with user info excluding password and token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });

  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    // Clear the cookie by setting its maxAge to 0
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
      console.log("Error in logout controller", error.message);
      res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    // req.user is attached by the 'protect' middleware
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile controller: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}; 