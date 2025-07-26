import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config({path: './src/.env'});

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port:  process.env.dialect,
    dialect: "mysql",
    logging: false 
  }
);

export default sequelize;