const CompanySettings = require("../models/companySettings.model");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

/* ================= SAVE / UPDATE ================= */
exports.saveCompanySettings = async (req, res) => {
  try {
    const { companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({
        message: "Company name is required",
      });
    }

    let settings = await CompanySettings.findOne();

    if (!settings) {
      settings = new CompanySettings({
        companyName,
        logo: req.file ? req.file.filename : null,
      });
    } else {
      settings.companyName = companyName;
      if (req.file) {
        settings.logo = req.file.filename;
      }
    }

    await settings.save();

    res.status(200).json({
      message: "Company settings saved successfully",
      data: settings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to save company settings",
    });
  }
};

/* ================= GET SETTINGS ================= */
exports.getCompanySettings = async (req, res) => {
  try {
    const settings = await CompanySettings.findOne();

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch company settings",
    });
  }
};
// controllers/settings.controller.js
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { current, newPass, confirm } = req.body;

    if (!current || !newPass || !confirm) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPass !== confirm) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Verify old password
    const isMatch = await user.comparePassword(current);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // ✅ Assign new password (PLAIN TEXT)
    user.password = newPass;

    // ✅ THIS triggers pre("save") → hashes password
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { current, newPass } = req.body;

    if (!current || !newPass) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ req.user is already available from auth middleware
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Compare CURRENT password
    const isMatch = await bcrypt.compare(current, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // ✅ Assign new password (PLAIN TEXT)
    user.password = newPass;

    // ✅ VERY IMPORTANT: triggers pre("save") → hashes password
    await user.save();

    return res.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

