const { Sequelize } = require("sequelize");

let sequelize;
// for some reason url isn't working for localhost, hence the 2 different approaches for the constructor
if (process.env.NODE_ENV === "production") {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    ssl: true,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    "postgres",
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "postgres"
    }
  );
}

module.exports = sequelize;
