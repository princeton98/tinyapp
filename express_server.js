const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: "session",
  keys: ["ECDq2KemQVCs5tqE", "eG1pZYJyjnmdrOqQ"]
}));

const urlDatabase = {};
const users = {};

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("login", templateVars);
  }
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  // checks to see if email and password match with an existing user
  if (getUserByEmail(email, users)) {
    if (bcrypt.compareSync(password, users[getUserByEmail(email, users)].password)) {
      req.session.user_id = getUserByEmail(email, users);
    } else {
      return res.status(403).end("Invalid password");
    }
  } else {
    return res.status(403).end("Invalid email or password");
  }
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("login");
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("register", templateVars);
  }
});
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (email === "" || password === "") {
    res.status(400).end("Invalid information");
  } else if (getUserByEmail(email, users)) {
    res.status(400).end("Email in use");
  } else {
    // hashing password, sending information into user database
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    let id = generateRandomString();
    const idName = { id, email, password: hashedPassword };
    req.session.user_id = id;
    users["" + id] = idName;
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).end("Please login or register first");
  } else {
    let templateVars = {
      urls: urlsForUser(req.session.user_id, urlDatabase),
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(403).end("You are not logged in");
  } else {
    let randomString = generateRandomString();
    // adding new shortURL and longURL into the database through a random string key
    urlDatabase[randomString] = { longURL: req.body.longURL, userID: req.session.user_id };
    res.redirect(`/urls/${randomString}`);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  console.log(req.params.id);
  //let shortURL = req.params.id.slice(1);
  if (!req.session.user_id) {
    res.status(403).end("Not logged in");
  } else if (!urlDatabase[req.params.id]) {
    res.status(403).end("URL does not exist");
    // checking if userID matches the current login user
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).end("URL locked");
  } else {
    let templateVars = {
      shortURL: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  }
});

app.post("/urls/:id", (req, res) => {
  console.log(req.params.id);
  //let shortURL = req.params.id.slice(1);
  if (!req.session.user_id) {
    res.status(403).end("You are not logged in");
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).end("You don't have permissions for this");
  } else {
    urlDatabase[req.params.id] = { longURL: req.body.updatedURL, userID: req.session.user_id };
    res.redirect("/urls");
  }
});

app.post(`/urls/:id/delete`, (req, res) => {
  //let shortURL = req.params.id.slice(1);
  if (!req.session.user_id) {
    res.status(403).end("You are not logged in");
  } else if (urlDatabase[req.params.id].userID !== req.session.user_id) {
    res.status(403).end("You cannot delete this link");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  //let shortURL = req.params.shortURL.slice(1);
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).end("Short URL doesn't exist");
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});