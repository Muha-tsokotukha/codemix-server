const { Router } = require("express");
const authcontroller = require("../controllers/authController");

const router = Router();

router.post("/signup", authcontroller.signup);

router.post("/login", authcontroller.login);

router.get("/logout", authcontroller.logout);

module.exports = router;
