const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
function generateRandomString() {
  // 6 random alphanumeric characters
  let arr = ['1','2','3','4','5','6','7','8','9','0','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  let randomNumorLetter = []
  for (let i = 0; i < 6; i++) {
    randomNumorLetter.push(arr[Math.floor(Math.random() * 63)]);  
  }
  finalString = randomNumorLetter.join("")
  return finalString;
};
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/login", (req, res) => {
  //console.log(req.body);
  res.cookie("username", req.body.username)
  //console.log(req.cookies["username"]);
  res.redirect("/urls");
})
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("urls");
})

app.get("/register", (req, res) => {
  templateVars = {
    username: req.cookies["username"]
  }
  res.render("register", templateVars);
})

app.get("/urls", (req, res) => {
  let templateVars = {}
     templateVars = {
      urls: urlDatabase,
      username: req.cookies["username"]
     }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  let newShortURL = shortURL.slice(1); //can shorten this
  let templateVars = { 
    shortURL: newShortURL, 
    longURL: urlDatabase[newShortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body);
  randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
    res.redirect(`/urls/:${randomString}`);
})
app.post("/urls/:id", (req, res) => {
  let sliceURL = req.params.id.slice(1);
  urlDatabase[sliceURL] = req.body.updatedURL;
  res.redirect("/urls");
})

app.post(`/urls/:shortURL/delete`, (req, res) => {
  let shortURL = req.params.shortURL;
  let sliceURL = shortURL.slice(1);
  delete urlDatabase[sliceURL];
  res.redirect ("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
})

//console.log(generateRandomString());

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})