const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "enter name"],
  },
  email: {
    type: String,
    required: [true, "enter email"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "email is not valid"],
  },
  password: {
    type: String,
    required: [true, "enter password"],
    minlength: [6, "Minimum password length is 6 characters"],
  },
});

userSchema.post("save", function (doc, next) {
  next();
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
  }

  throw Error("Email or password is not correct");
};

const User = mongoose.model("user", userSchema);

module.exports = User;
