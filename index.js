const express = require('express')
const hbs = require('express-handlebars')
const path = require('path')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const exSession = require('express-session')

dotenv.config({ path: "./.env" });

const db = process.env.DATABASE;

mongoose.set("strictQuery", false);
mongoose.connect(db).then(() => {
  console.log("db connenction successful");
});

const app = express()

app.use(express.json());

// app.use((req, res, next) => {
//   console.log(req.method + req.originalUrl);
//   next();
// });

app.use(
  exSession({
    secret: "key",
    cookie: { maxAge: 6000000},
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.set('viwes', path.join(__dirname, 'views'))
app.set('view engine', hbs)

app.engine('hbs', hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout",
    partialsDir: __dirname + "/views/partials"
}))

app.use(express.static(path.join(__dirname,"public")))
app.use(express.static(path.join(__dirname,"vendor")))

var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/user");

app.use("/admin", adminRouter);
app.use("/", usersRouter);

app.listen(3000,()=>console.log("basil"))