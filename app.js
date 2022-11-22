const express = require("express")
const dotenv = require("ejs")
require("dotenv").config()
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const app = express()
const cookieParser = require("cookie-parser");
const registerRouter = require("./routes/registerRoute");
const loginRouter = require("./routes/loginRoute")
const userDashboardRouter = require("./routes/userDashboardRoute")

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

//set up mongoDB connection
mongoose.connect(process.env.MONGO_ATLAS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to mongo.");
  })
  .catch((err) => {
    console.log("Error connecting to mongo.", err);
});

app.use("/", registerRouter);
app.use("/", loginRouter);
app.use("/", userDashboardRouter);


app.listen(3000, function() {
    console.log("Server started on port 3000.");
});
  
