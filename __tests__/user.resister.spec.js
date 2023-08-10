const request = require("supertest");
const app = require("../src/app");
const User = require("../src/user/User");
const sequelize = require("../src/config/database");

const endpointUrl = "/api/1.0/users";

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const validUser = {
  username: "user1",
  email: "user@gmail.com",
  password: "P4@ssword",
};

const postUser = (user = validUser) => {
  return request(app).post(endpointUrl).send(user);
};

describe("Create User", () => {
  it("should return 200 OK when request is valid", async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  it("should return success message when signup request is valid", async () => {
    const response = await postUser();
    expect(response.body.message).toEqual("User created");
  });

  it("should saves the user to database", async () => {
    await postUser();
    const userList = await User.findAll();
    const saveUser = userList[0];
    expect(saveUser.username).toBe("user1");
    expect(saveUser.email).toBe("user@gmail.com");
  });

  it("should saves the username and email to database", async () => {
    await postUser();
    const userList = await User.findAll();
    const saveUser = userList[0];
    expect(saveUser.username).toBe("user1");
    expect(saveUser.email).toBe("user@gmail.com");
  });

  it("hashes the passowrd in database", async () => {
    await postUser();
    const userList = await User.findAll();
    const saveUser = userList[0];
    expect(saveUser.password).not.toBe("P4ssword");
  });

  it("should return 400 when username is null", async () => {
    const response = await postUser({ ...validUser, username: null });
    expect(response.status).toBe(400);
  });

  it("should validationError field in response body when validation error occur", async () => {
    const response = await postUser({ ...validUser, username: null });
    const body = response.body;
    expect(body.validationErrors).not.toBeUndefined();
  });

  it.each`
    field         | value              | expectedMessage
    ${"username"} | ${null}            | ${"Username can not be null"}
    ${"username"} | ${"usr"}           | ${"Must have min 4 and max 32 charactor"}
    ${"username"} | ${"a".replace(33)} | ${"Must have min 4 and max 32 charactor"}
    ${"email"}    | ${null}            | ${"E-mail is not null"}
    ${"email"}    | ${"mail.com"}      | ${"E-mail is not valid"}
    ${"email"}    | ${"user@mail"}     | ${"E-mail is not valid"}
    ${"password"} | ${null}            | ${"Password can not be null"}
    ${"password"} | ${"P@ss"}          | ${"Password must be at least 6 characters"}
    ${"password"} | ${"alllowercase"}  | ${"Password must have at least 1 uppercase, 1 lowercase and number"}
  `(
    "return $expectedMessage when $field is $value",
    async ({ field, expectedMessage, value }) => {
      const user = {
        username: "user1",
        email: "user@gmail.com",
        password: "P4ssword",
      };
      user[field] = value;
      const response = await postUser(user);
      const body = response.body;
      expect(body.validationErrors[field]).toEqual(expectedMessage);
    }
  );

  it("should return E-mail in use when same email is already in use", async () => {
    await User.create({ ...validUser }); //create user before.
    const response = await postUser(validUser);
    expect(response.status).toBe(400);
    expect(response.body.validationErrors.email).toBe("E-mail in use");
  });

  it("should return errors for both username is null and email is in use", async () => {
    await User.create({ ...validUser }); //create user before.
    const response = await postUser({
      username: null,
      email: validUser.email,
      password: validUser.password,
    });
    expect(Object.keys(response.body.validationErrors)).toEqual([
      "username",
      "email",
    ]);
  });
});
