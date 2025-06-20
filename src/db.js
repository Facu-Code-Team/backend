import { Sequelize } from "sequelize";

const sequelize = new Sequelize("CarpinChords", "root", "Jamancapiero85.", {
  host: "localhost",
  dialect: "mysql"
});

export default sequelize;