import "../../config/env.js";
import { Sequelize } from "sequelize";

const connection = new Sequelize(
  process.env.BD_DATABASE,
  process.env.BD_USER,
  process.env.BD_PASSWORD,
  {
    host: process.env.BD_HOST,
    port: process.env.BD_PORT,
    dialect: "mysql",

    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },

    logging: false,
  },
);

export default connection;
