const Sequelize = require("sequelize");
const config = require("config");
// const sequelize = new Sequelize("likhitty", "my-db-user", "db-p4ss", {
//   dialect: "sqlite",
//   storage: "./database.sqlite",
//   logging: false,
// });

const dbConfig = config.get("database");
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
  }
);

module.exports = sequelize;
