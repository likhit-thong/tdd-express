const express = require("express");
const router = express.Router();
const UserService = require("./user.service");
//const { check, validationResult } = require("express-validator");
const { check, validationResult } = require("express-validator");

router.post(
  "/api/1.0/users",
  check("username")
    .notEmpty()
    .withMessage("Username can not be null")
    .bail()
    .isLength({ min: 4, max: 32 })
    .withMessage("Must have min 4 and max 32 charactor"),
  check("email")
    .notEmpty()
    .withMessage("E-mail is not null")
    .bail()
    .isEmail()
    .withMessage("E-mail is not valid"),
  check("password")
    .notEmpty()
    .withMessage("Password can not be null")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .bail()
    .matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
    .withMessage(
      "Password must have at least 1 uppercase, 1 lowercase and number"
    ),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors.array().forEach((error) => {
        validationErrors[error.path] = error.msg;
      });
      return res.status(400).send({ validationErrors });
    }
    // if (!errors.isEmpty()) {
    //   const validationErrors = {};
    //   errors.array().forEach((error) => {
    //     validationErrors[error.path] = error.msg;
    //   });
    //   return res.status(400).send({ validationErrors });
    // }
    try {
      await UserService.save(req.body);
      return res.send({ message: "User created" });
    } catch (e) {
      return res
        .status(500)
        .send({ validationErrors: { email: "E-mail in use" } });
    }
  }
);

module.exports = router;
