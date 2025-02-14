const express = require("express");
const connectDb = require("../config/db");
const userRouter = require("../routes/userRoutes");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users",userRouter);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
