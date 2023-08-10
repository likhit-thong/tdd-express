const express = require("express");
const app = express();
const userRouter = require("./user/user.router");

app.use(express.json());
app.use(userRouter);

module.exports = app;
