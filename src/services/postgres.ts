import { Sequelize } from "sequelize";
import { config } from "../utils/helper";

export interface Database {
  nearIndexer: Sequelize;
}

const nearIndexerDB = new Sequelize({
  ...config.database.nearIndexer,
  dialect: "postgres",
  logging: false,
});

export const database: Database = {
  nearIndexer: nearIndexerDB,
};
