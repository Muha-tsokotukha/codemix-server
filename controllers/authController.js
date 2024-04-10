const jwt = require("jsonwebtoken");
const User = require("../models/User");

const maxAge = 3 * 24 * 60 * 60;

const handleErrors = (err) => {
  const errors = {};

  if (err.code === 11000) {
    errors.email = "Email is already registered";

    return errors;
  }

  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

const createToken = (id) => {
  return jwt.sign({ id }, "codemix project secret", { expiresIn: maxAge });
};

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({
      name,
      email,
      password,
    });
    const token = createToken(user._id);

    res.cookie("token", token, { maxAge: maxAge * 1000 });
    res.status(201).json({ user: user.email });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json(errors);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);

    res.cookie("token", token, { maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  res.cookie("token", "", { maxAge: 1 });
  res.status(200).send({});
};

module.exports = { signup, login, logout };
