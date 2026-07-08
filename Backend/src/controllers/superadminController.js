const jwt = require("jsonwebtoken");

exports.loginSuccess = async (req, res) => {
  console.log("LOGIN SUCCESS");
  console.log("REQ USER:", req.user);

  const token = jwt.sign(
    {
      id: req.user._id,
      role: req.user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  console.log("TOKEN:", token);

  res.redirect(
    `https://admin.medikto.com/superadmin/login?token=${token}`
  );
};