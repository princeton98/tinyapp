const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser())

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
function lookUp(newEmail) {
  let keys = Object.keys(users);
  for (let i = 0; i < keys.length; i++) {
    if(users[keys[i]].email === newEmail) {
      return keys[i];
    }
  }
  return false;
}

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
  if (lookUp(req.body.email)) {
    if(users[lookUp(req.body.email)].password === req.body.password) {
      res.cookie("user_id",lookUp(req.body.email))
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
  let templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("login", templateVars);
})
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("login");
})

app.get("/register", (req, res) => {
  templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("register", templateVars);
})
app.post("/register", (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let id = generateRandomString();
  if (email === "" || password === "") {
    res.status(400).end("Invalid information");
  } else if (lookUp(email)) {
      res.status(400).end("Email in use")
  }
  else {
      const idName = {id, email, password}
      res.cookie("user_id", id);
      users[""+ id] = idName;
      res.redirect("/urls");

  }
  //console.log(users);
})

app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.end("Please login or register first");
  } else {
     let templateVars = {
       urls: urlsForUser(req.cookies["user_id"]),
       user: users[req.cookies["user_id"]]
      }
      //console.log(urlsForUser(req.cookies["user_id"]));
  res.render("urls_index", templateVars);
}
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
}
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL
  let newShortURL = shortURL.slice(1); //can shorten this
      if (!req.cookies["user_id"]) {
        res.end("Not logged in");
      }
      else if (urlDatabase[newShortURL].userID !== req.cookies["user_id"]) {
        res.end("URL locked");
      } else {
  let templateVars = { 
    shortURL: newShortURL, 
    longURL: urlDatabase[newShortURL].longURL,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
}});

app.post("/urls", (req, res) => {
   console.log(req.body);
  randomString = generateRandomString();
  urlDatabase[randomString] = {longURL: req.body.longURL, userID: req.cookies["user_id"]}
  //console.log(urlDatabase);
    res.redirect(`/urls/:${randomString}`);
})
app.post("/urls/:id", (req, res) => {
  let sliceURL = req.params.id.slice(1);
  if (!req.cookies["user_id"]){
    res.end("You are not logged in")
  } else if (urlDatabase[sliceURL].userID !== req.cookies["user_id"]) {
    res.end("You cannot delete this link");
  } else {
  urlDatabase[sliceURL] = {longURL:req.body.updatedURL, userID: req.cookies["user_id"]};
  //console.log(req.body.updatedURL)
  res.redirect("/urls");
}})

app.post(`/urls/:shortURL/delete`, (req, res) => {
  let shortURL = req.params.shortURL;
  let sliceURL = shortURL.slice(1);
  if (!req.cookies["user_id"]){
    res.end("You are not logged in")
  } else if (urlDatabase[sliceURL].userID !== req.cookies["user_id"]) {
    res.end("You cannot delete this link");
  } else {
  delete urlDatabase[sliceURL];
  res.redirect ("/urls");
}});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
})

//console.log(generateRandomString());
//console.log(urlsForUser("aJ481W"));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
})