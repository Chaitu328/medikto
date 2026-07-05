const jwt = require("jsonwebtoken");

exports.loginSuccess = async (req, res) => {
  const token = jwt.sign(
    {
      id: req.user._id,
      role: "superadmin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  res.redirect(
    `http://localhost:5173/superadmin?token=${token}`
  );
};