const User = require("../models/userModel");
const cloudinary = require("../config/cloudinary");



exports.getProfile = async (req, res) => {
  try {
    // Get first user (without auth and user id)
    const user = await User.findOne().select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json(user);

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

exports.getAllUsers = async (
  req,
  res
) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      phone,
      age,
      gender,
      bloodGroup,
      height,
      weight
    } = req.body;

    let profilePic;

    // upload image
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      profilePic = result.secure_url;
    }

    const updateData = {};

    if (firstName) updateData.firstName = firstName;
    if (phone) updateData.phone = phone;
    if (age) updateData.age = age;
    if (gender) updateData.gender = gender.toLowerCase();
    if (bloodGroup) updateData.bloodGroup = bloodGroup.toUpperCase();
    if (height) updateData.height = height;
    if (weight) updateData.weight = weight;

    if (profilePic) updateData.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.addFamilyMember = async (req, res) => {
  try {
    const { name, relation, age } = req.body;

    if (!name || !relation) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findById(req.user.id);

    user.familyMembers.push({ name, relation, age });

    await user.save();

    res.json(user.familyMembers);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// exports.updateSubscription = async (req, res) => {
//   try {
//     const { plan } = req.body;

//     if (!["free", "basic", "premium"].includes(plan)) {
//       return res.status(400).json({ message: "Invalid plan" });
//     }

//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       { subscription: plan },
//       { new: true }
//     ).select("-password");

//     res.json({
//       message: "Subscription updated",
//       subscription: user.subscription
//     });

//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


exports.updateSubscription = async (req, res) => {
  try {
    const { plan, userId } = req.body;

    // Validate plan
    if (!["free", "basic", "premium"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }

    // Update subscription without token
    const user = await User.findByIdAndUpdate(
      userId,
      { subscription: plan },
      { new: true }
    ).select("-password");

    // User not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription: user.subscription,
      data: user,
    });

  } catch (err) {
    console.log("SUBSCRIPTION UPDATE ERROR:", err.message);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};