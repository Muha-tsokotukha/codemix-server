const { Router } = require("express");
const authcontroller = require("../controllers/authController");
const openaiController = require("../controllers/openaiController");

const router = Router();

router.post("/signup", authcontroller.signup);

router.post("/login", authcontroller.login);

router.get("/logout", authcontroller.logout);

router.post("/openai/message", openaiController.sendMessageNewBot);

module.exports = router;
