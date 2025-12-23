const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({ name, email, password });
    const token = generateToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Attempting login for email:", email);

    const user = await User.findOne({ email });
    console.log("User found:", user ? user.email : "NOT FOUND");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    console.log("Password match:", isMatch);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};



exports.createUserBySuperAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, gender, address, dateofbirth, role } = req.body;

    // Only allow admin or delivery-boy
    if (!["admin", "delivery-boy"].includes(role)) {
      return res.status(400).json({ 
        message: "Only 'admin' or 'delivery-boy' can be created by superadmin" 
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password,
      phone,
      gender,
      address,
      dateofbirth,
      role,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json({
      message: `${role} created successfully`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        image: newUser.image,
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      message: "Users retrieved successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
   try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User profile retrieved",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user", error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, gender, address, dateofbirth, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (address) user.address = address;
    if (dateofbirth) user.dateofbirth = dateofbirth;
    if (role) user.role = role;
    if (req.file) user.image = `/uploads/${req.file.filename}`;

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        address: user.address,
        dateofbirth: user.dateofbirth,
        image: user.image,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};
// GET LOGGED-IN USER PROFILE
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User deleted successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

// GET ALL DELIVERY PERSONS
exports.getDeliveryPersons = async (req, res) => {
  try {
    const deliveryPersons = await User.find({ role: "delivery-boy" })
      .select("_id name phone email");

    res.json(deliveryPersons);
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivery persons", error: error.message });
  }
};
