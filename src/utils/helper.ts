import { connect } from "near-api-js";
import { Config, getConfig } from "./config";
import fs from "fs";
import csvParser from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";

const NETWORK = "mainnet";
export const config = getConfig(NETWORK);

export async function initViewer(c: Config = config) {
  const near = await connect(c.near);
  return await near.account("");
}

export const readCSV = async (filename: string): Promise<Array<any>> => {
  return new Promise((resolve) => {
    const table: any = [];
    fs.createReadStream(filename)
      .pipe(csvParser())
      .on("data", (row: any) => {
        table.push(row);
      })
      .on("end", () => {
        console.log("CSV file successfully processed");
        console.log(`Total # of rows from CSV: ${table.length}`);
        resolve(table);
      });
  });
};

export const writeCSV = async (
  filename: string,
  data: Array<any>,
  append = false
) => {
  if (data.length === 0) {
    console.log("Data is empty");
    return;
  }
  const csvWriter = createObjectCsvWriter({
    path: filename,
    header: Object.keys(data[0]).map((k) => ({ id: k, title: k })),
    // Issue: If file not exists and append is true, file will be created without header
    // In order to create file with header, we should check whether file exists
    append: fs.existsSync(filename) && append,
  });
  await csvWriter.writeRecords(data);
  console.log("The CSV file was written successfully");
};
