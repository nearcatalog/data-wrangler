import { Sequelize } from "sequelize";
import { config } from "../utils/helper";

export interface Database {
  nearIndexer: Sequelize;
  nearValidatorMonitor?: Sequelize;
}

const nearIndexerDB = new Sequelize({
  ...config.database.nearIndexer,
  dialect: "postgres",
  logging: false,
});

const nearValidatorMonitorDB = config.database.nearValidatorMonitor?.username
  ? new Sequelize({
      ...config.database.nearValidatorMonitor,
      dialect: "postgres",
      logging: false,
    })
  : undefined;

export const database: Database = {
  nearIndexer: nearIndexerDB,
  nearValidatorMonitor: nearValidatorMonitorDB,
};
