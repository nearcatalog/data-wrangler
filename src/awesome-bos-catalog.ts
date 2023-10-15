import { Gas } from "near-units";
import { config, readCSV } from "./utils/helper";
import { getNearContract } from "./utils/near";
import { nearSocialGet } from "./utils/social";

main().catch((e) => console.error(e));

const SOURCES = ["near-social", "horizon", "awesomenear"];

interface Project {
  source: Record<string, string>;
  status: string;
}

async function queryCatalog() {
  const { nearSocialContractId, awesomeBosAccountId } = config;
  // NEAR_ENV=mainnet near view social.near get '{"keys":["awesomebos.near/catalog/**"]}'
  const data = await nearSocialGet(
    nearSocialContractId,
    `${awesomeBosAccountId}/catalog/**`
  );
  const catalog = data[awesomeBosAccountId].catalog;
  console.log(`${Object.keys(catalog).length} projects in the catalog`);
  return catalog;
}

async function main() {
  const now = Date.now();
  const { nearSocialContractId, awesomeBosAccountId } = config;

  const contract = (await getNearContract(
    nearSocialContractId,
    awesomeBosAccountId,
    ["get"],
    ["set"]
  )) as any;

  console.log(
    `[${new Date(now).toISOString()}] Creating Awesome BOS catalog ...`
  );

  const catalog = await queryCatalog();

  const rows = await readCSV("./dataset/local/awesome-bos-catalog.csv");
  // only create catalog for verified projects
  const verified = rows.filter((p) => p.verified === "Y");
  const projects: Record<string, Project> = {};
  for (const p of verified) {
    const sources: Record<string, string> = {};
    for (const s of SOURCES) {
      if (p[`source.${s}`]) {
        sources[s] = p[`source.${s}`];
      }
    }
    if (!catalog[p.id]) {
      projects[p.id] = {
        source: sources,
        status: p.status,
      };
    }
  }

  console.log(JSON.stringify(projects, null, 2));
  console.log(`${Object.keys(projects).length} projects to update`);

  await contract.set({
    args: {
      data: {
        [awesomeBosAccountId]: {
          catalog: projects,
        },
      },
    },
    gas: Gas.parse("300 Tgas").toString(10),
    // amount: NEAR.parse("0.1 NEAR").toString(10),
  });

  await queryCatalog();
  // console.log('Awesome BOS Catalog', JSON.stringify(catalog, null, 2));
}
