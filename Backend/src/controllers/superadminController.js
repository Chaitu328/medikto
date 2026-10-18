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

  let frontendOrigin = process.env.ADMIN_URL || "https://admin.medikto.com";

  if (req.query?.state) {
    try {
      const decoded = JSON.parse(Buffer.from(req.query.state, "base64").toString("utf-8"));
      if (decoded.origin) {
        const url = new URL(decoded.origin);
        if (
          url.hostname === "localhost" ||
          url.hostname === "127.0.0.1" ||
          url.hostname.endsWith(".medikto.com") ||
          url.hostname === "medikto.com"
        ) {
          frontendOrigin = url.origin;
        }
      }
    } catch (e) {
      console.warn("Failed to decode OAuth state in loginSuccess:", e.message);
    }
  }

  res.redirect(`${frontendOrigin}/superadmin/login?token=${token}`);
};
