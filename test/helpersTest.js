const { assert } = require("chai");

const { getUserByEmail } = require("../helpers");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(expectedOutput, user)
  });
  it("should return undefined when passing a non-existent email", function() {
    const user = getUserByEmail("balnk@babab.com", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(expectedOutput, user);
  })
})