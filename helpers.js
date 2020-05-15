const getUserByEmail = function(email, database) {
  let users = Object.keys(database);
  for (let i = 0; i < users.length; i++) {
    if (database[users[i]].email === email) {
      return users[i];
    }
  }
};
const generateRandomString = function() {
  let arr = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  let random = [];
  for (let i = 0; i < 6; i++) {
    random.push(arr[Math.floor(Math.random() * 63)]);
  }
  let finalString = random.join("");
  return finalString;
};
const urlsForUser = function(id, database) {
  let URLs = [];
  let users = Object.keys(database);
  for (let i = 0; i < users.length; i++) {
    if (database[users[i]].userID === id) {
      let tempURLs = {};
      tempURLs.shortURL = users[i];
      tempURLs.longURL = database[users[i]].longURL;
      URLs.push(tempURLs);
    }
  }
  return URLs;
};
module.exports = { 
  getUserByEmail,
  generateRandomString,
  urlsForUser 
};