const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const {getUserByEmail} = require("./helpers");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name:"session",
  keys:["ECDq2KemQVCs5tqE", "eG1pZYJyjnmdrOqQ"]
}))

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "aJ481W"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "aJ481W"}
};
const users = {
 /* "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "userRandomID2": {
    id: "userRandomID", 
    email: "person@example.com", 
    password: "purple-monkey-dinosaur"
  },
  */
}
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

function urlsForUser(id) {
  let URLs = []
  let keys = Object.keys(urlDatabase)
  //if (id === cookie("user_id")) {
    for (let i = 0; i < keys.length; i++) {
      if (urlDatabase[keys[i]].userID === id) {
        let tempURLs = {}
        tempURLs.shortURL = keys[i];
        tempURLs.longURL = urlDatabase[keys[i]].longURL;
        URLs.push(tempURLs);
        //console.log("hello");
      }
    }
  //}
  //console.log(urlDatabase.length);
  Object.assign(URLs);
  return URLs;
}

app.get("/", (req, res) => {
  if(req.session.user_id) {
  res.redirect("/urls");
  }
  else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/login", (req, res) => {
  //console.log(req.body);
  if (getUserByEmail(req.body.email, users)) {
      if (bcrypt.compareSync(req.body.password, users[getUserByEmail(req.body.email, users)].password)){
      req.session.user_id = getUserByEmail(req.body.email, users);
    }
    else {
      return res.status(403).end("Invalid password");
    }
  }
  else {
    return res.status(403).end("Invalid email or password");
  }
  res.redirect("/urls");
})

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
  let templateVars = {
    //user: users[req.cookies["user_id"]]
    user: users[req.session.user_id]
  }
  res.render("login", templateVars);
}})
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("login");
})

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
  templateVars = {
    //user: users[req.cookies["user_id"]]
    user: users[req.session.user_id]
  }
  res.render("register", templateVars);
}})
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).end("Invalid information");
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400).end("Email in use")
  }
  else {
    let email = req.body.email
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    let id = generateRandomString();
      const idName = {id, email, password: hashedPassword}
      //res.cookie("user_id", id);
      req.session.user_id = id;
      users[""+ id] = idName;
      res.redirect("/urls");

  }
  //console.log(users);
})

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.end("Please login or register first");
  } else {
     let templateVars = {
       urls: urlsForUser(req.session.user_id),
       user: users[req.session.user_id]
      }
      //console.log(urlsForUser(req.cookies["user_id"]));
  res.render("urls_index", templateVars);
}
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
  let templateVars = {
    user: users[req.session.user_id]
  }
  res.render("urls_new", templateVars);
}
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id.slice(1);
      if (!req.session.user_id) {
        res.end("Not logged in");
      } else if (!urlDatabase[shortURL]) {
          res.end("URL does not exist");
      } else if (urlDatabase[shortURL].userID !== req.session.user_id) {
        res.end("URL locked");
      } else {
  let templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
}});

app.post("/urls", (req, res) => {
   //console.log(req.body);
   if (!req.session.user_id) {
     res.end("You are not logged in")
   } else {
  randomString = generateRandomString();
  urlDatabase[randomString] = {longURL: req.body.longURL, userID: req.session.user_id}
  //console.log(urlDatabase);
    res.redirect(`/urls/:${randomString}`);
}})
app.post("/urls/:id", (req, res) => {
  let sliceURL = req.params.id.slice(1);
  if (!req.session.user_id){
    res.end("You are not logged in")
  } else if (urlDatabase[sliceURL].userID !== req.session.user_id) {
    res.end("You don't have permissions for this");
  } else {
  urlDatabase[sliceURL] = {longURL:req.body.updatedURL, userID: req.session.user_id};
  //console.log(req.body.updatedURL)
  res.redirect("/urls");
}})

app.post(`/urls/:id/delete`, (req, res) => {
  let shortURL = req.params.id;
  let sliceURL = shortURL.slice(1);
  if (!req.session.user_id){
    res.end("You are not logged in")
  } else if (urlDatabase[sliceURL].userID !== req.session.user_id) {
    res.end("You cannot delete this link");
  } else {
  delete urlDatabase[sliceURL];
  res.redirect ("/urls");
}});


app.get("/u/:shortURL", (req, res) => {
  let newShortURL = req.params.shortURL.slice(1);
    if (!urlDatabase[newShortURL]) {
      res.end("Short URL doesn't exist");
    } else {
  const longURL = urlDatabase[newShortURL].longURL;
  res.redirect(longURL);
}})

//console.log(generateRandomString());
//console.log(urlsForUser("aJ481W"));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})