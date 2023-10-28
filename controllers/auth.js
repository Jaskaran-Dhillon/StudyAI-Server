const jwt = require("jsonwebtoken");
const mySecret = process.env.SECRET;

exports.isAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    res.status(401).json({
      error: "Unauthorized.",
    });
  }
  const token = authHeader.split(" ")(1);
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, mySecret);
    if (decodedToken) {
      next();
    } else {
      res.status(401).json({
        error: "Unauthorized.",
      });
    }
  } catch (e) {
    res.status(500).json({
      error: e,
    });
  }
};
