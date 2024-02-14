import { Op, Model, DataTypes } from "sequelize";
import { msToNano } from "./time";
import { database } from "../services/postgres";

export class BlocksModel extends Model {
  declare block_height?: string;
  declare block_hash?: string;
  declare prev_block_hash?: string;
  declare block_timestamp?: string;
  declare total_supply?: string;
  declare gas_price?: string;
  declare author_account_id?: string;
}

BlocksModel.init(
  {
    block_height: {
      type: DataTypes.BIGINT,
    },
    block_hash: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    prev_block_hash: {
      type: DataTypes.TEXT,
    },
    block_timestamp: {
      type: DataTypes.DECIMAL,
    },
    total_supply: {
      type: DataTypes.DECIMAL,
    },
    gas_price: {
      type: DataTypes.DECIMAL,
    },
    author_account_id: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: false,
    tableName: "blocks",
    sequelize: database.nearIndexer,
  }
);

export async function getBlockHeightAt(timestampMs: number): Promise<number> {
  const timestampNano = msToNano(timestampMs);
  const result = await BlocksModel.findAll<BlocksModel>({
    attributes: ["block_height"],
    where: {
      block_timestamp: {
        [Op.lte]: timestampNano,
      },
    },
    order: [["block_timestamp", "DESC"]],
    limit: 1,
  });
  return Number(result[0].block_height);
}
