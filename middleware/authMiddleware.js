const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const { token } = req.cookies;

  if (token) {
    jwt.verify(token, "codemix project secret", (err, decodedToken) => {
      if (err) {
        console.log(err);
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    console.log(err);
  }
};

module.exports = { requireAuth };
