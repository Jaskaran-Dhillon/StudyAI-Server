const sequelize = require("../util/database");
const User = require("../models/user");
const { isBlank } = require("../util/helper");
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const mySecret = process.env.SECRET;
const { isEmail, trim, escape } = require("validator");

const sanitizeUser = (user) => {
  let { firstName, lastName, email, password } = user;
  const sanitizedUser = {
    email: escape(trim(email || "")),
    firstName: escape(trim(firstName || "")),
    lastName: escape(trim(lastName || "")),
    password: escape(trim(password || "")),
  };

  return sanitizedUser;
};

const validateUser = (user) => {
  const { firstName, lastName, email, password } = user;

  switch (true) {
    case isBlank(firstName): {
      throw new Error("Missing field: firstName");
    }
    case isBlank(lastName): {
      throw new Error("Missing field: lastName");
    }
    case isBlank(email): {
      throw new Error("Missing field: email");
    }
    case firstName.length > 50: {
      throw new Error("First name is too long (50 chars max)");
    }
    case lastName.length > 50: {
      throw new Error("Last name is too long (50 chars max)");
    }
    case isBlank(password): {
      throw new Error("Missing field: password");
    }
    case !isEmail(email): {
      throw new Error("Invalid field: email");
    }
    case !password.match(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
    ): {
      throw new Error("Invalid field: password");
    }
    default:
      return true;
  }
};

const userAlreadyExists = async (email) => {
  const result = await User.findOne({ where: { email: email } });
  return result;
};

const convertToHash = (password) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

exports.authenticateUser = async (req, res, next) => {
  const body = sanitizeUser(req.body);

  if (body.email && body.password) {
    try {
      const result = await User.findOne({ where: { email: body.email } });
      if (result === null) {
        res.status(404).json({
          user: body,
          error: "User does not exist.",
        });
      } else {
        if (bcrypt.compareSync(body.password, result.password)) {
          const token = jwt.sign(
            {
              email: result.email,
              userId: result.id.toString(),
            },
            mySecret,
            { expiresIn: "2h" }
          );

          res.status(200).json({
            userId: result.id.toString(),
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
            token: token,
          });
        } else {
          res.status(401).json({
            user: body,
            error: "Invalid password.",
          });
        }
      }
    } catch (e) {
      res.status(422).json({
        user: body,
        error: e.message,
      });
    }
  } else {
    res.status(422).json({
      error: "Invalid input"
    });
  }
};

exports.createNewUser = async (req, res, next) => {
  let newUser = {};
  const body = sanitizeUser(req.body);
  let validInput = false;
  const alreadyExists = await userAlreadyExists(body.email);

  if (body.email && alreadyExists) {
    res.status(409).json({
      user: body,
      error: "User already exists.",
    });
  } else {
    try {
      newUser = {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
      };
      validInput = validateUser(newUser);
    } catch (e) {
      res.status(422).json({
        user: body,
        error: e.message,
      });
    }

    if (validInput) {
      try {
        newUser.password = convertToHash(newUser.password);
        await sequelize.transaction(async (t) => {
          //explicit transactions only useful if doing multiple calls together, otherwise db statements already use transactions
          await User.create(newUser, { transaction: t });
        });

        res.status(201).json({
          user: newUser,
        });
      } catch (e) {
        res.status(422).json({
          user: body,
          error: e.message,
        });
      }
    }
  }
};
