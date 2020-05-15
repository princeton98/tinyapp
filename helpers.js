const getUserByEmail = function(email, database) {
  let keys = Object.keys(database);
  for (let i = 0; i < keys.length; i++) {
    if(database[keys[i]].email === email) {
      return keys[i];
    }
  }
}
module.exports = {getUserByEmail};