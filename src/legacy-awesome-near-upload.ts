import { Gas, NEAR } from "near-units";
import { config, readCSV } from "./utils/helper";
import { getNearContract } from "./utils/near";
import { nearSocialKeys } from "./utils/social";

main().catch((e) => console.error(e));

type Tags = Record<string, string>;
type Auditing = Record<string, string>;
type Contracts = Record<string, string>;
type Tokens = Record<string, Token>;
type Validators = Record<string, string>;
type Investors = Record<string, string>;
type Grants = Record<string, string>;

interface Image {
  url?: string;
  ipfs_cid?: string;
}

interface Icon {
  thumb: string;
  small: string;
}

interface Address {
  near?: string;
  aurora?: string;
  ethereum?: string;
  octopus?: string;
}

interface Buy {
  url: string;
}

interface Platform {
  coingecko?: string;
  coinmarketcap?: string;
}

interface Token {
  symbol: string;
  name: string;
  icon: Icon;
  address: Address;
  buy: Buy;
  platform: Platform;
}

type LinkType =
  | "twitter"
  | "medium"
  | "telegram"
  | "discord"
  | "github"
  | "linkedIn"
  | "facebook"
  | "astroDAO"
  | "whitepaper";

interface LinkTree {
  twitter?: string;
  medium?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  linkedIn?: string;
  facebook?: string;
  astroDAO?: string;
  docs?: string;
  whitepaper?: string;
}

interface BOS {
  app: string;
}

interface NearSocialProject {
  name: string;
  tagline: string;
  description: string;
  image: Image;
  tags: Tags;
  verticals?: Tags;
  product_type?: Tags;
  geo?: string;
  website?: string;
  dapp?: string;
  linktree: LinkTree;
  bos?: BOS;
  stage?: string;
  auditing?: Auditing;
  contracts?: Contracts;
  tokens?: Tokens;
  team?: number;
  validator?: Validators;
  investor?: Investors;
  grants?: Grants;
}

interface AwesomeNearProject {
  id: string;
  slug: string;
  title: string;
  oneliner: string;
  description: string;
  logo: string;
  categories: string;
  website: string;
  dapp: string;
  twitter: string;
  medium: string;
  telegram: string;
  discord: string;
  github: string;
  linkedIn: string;
  facebook: string;
  astroDAO: string;
  whitepaper: string;
  status: string;
}

interface AwesomeNearContract {
  address: string;
  name: string;
  projectId: string;
}

function parseCategories(categories: string): Tags {
  const tags: Tags = {};
  for (const c of categories.slice(1, categories.length - 1).split(",")) {
    tags[c] = "";
  }
  return tags;
}

function parseLinkTree(project: AwesomeNearProject): LinkTree {
  const keys: LinkType[] = [
    "twitter",
    "medium",
    "telegram",
    "discord",
    "github",
    "linkedIn",
    "facebook",
    "astroDAO",
    "whitepaper",
  ];
  const linkTree: LinkTree = {};
  for (const key of keys) {
    if (project[key]) {
      linkTree[key] = project[key];
    }
  }
  return linkTree;
}

function parseImage(logo: string): Image {
  return {
    url: "https://web.archive.org/web/20230521202108im_/" + logo,
  };
}

function awesomeNearProjectToNearSocial(project: AwesomeNearProject) {
  const transformed: NearSocialProject = {
    name: project.title,
    tagline: project.oneliner,
    description: project.description,
    image: parseImage(project.logo),
    tags: parseCategories(project.categories),
    linktree: parseLinkTree(project),
  };

  return {
    profile: transformed,
  };
}

async function queryLegacyAwesomeNEAR() {
  // NEAR_ENV=mainnet near view social.near get '{"keys":["legacy-awesome.near/project/octopus-network"]}'
  const data = await nearSocialKeys(
    config.nearSocialContractId,
    `${config.legacyAwesomeNearAccountId}/project/*`
  );
  console.log("Legacy Awesome NEAR Data", JSON.stringify(data, null, 2));
  return data[config.legacyAwesomeNearAccountId].project;
}

function findContracts(
  slug: string,
  projects: AwesomeNearProject[],
  contracts: AwesomeNearContract[]
) {
  // exclude DAO contracts on AstroDAO / SputnikDAO because it contains too many contracts
  if (slug === "astrodao") {
    return { "sputnik-dao.near": "" };
  } else if (slug === "mintbase") {
    return { "mintbase1.near": "" };
  }

  const project = projects.filter((p) => p.slug === slug)[0];
  const addresses = contracts
    .filter((c) => c.projectId === project.id)
    .map((c) => c.address);
  if (addresses.length > 0) {
    const data: Contracts = {};
    for (const address of addresses) {
      data[address] = "";
    }
    // add contract address for NEAR Social
    if (slug === "near-social-social08") {
      data["social.near"] = "";
    }
    return data;
  } else {
    return null;
  }
}

async function main() {
  const now = Date.now();
  const { nearSocialContractId, legacyAwesomeNearAccountId } = config;

  const contract = (await getNearContract(
    nearSocialContractId,
    legacyAwesomeNearAccountId,
    ["get"],
    ["set"]
  )) as any;

  const legacy = await queryLegacyAwesomeNEAR();
  const projects = await readCSV("./dataset/local/awesome-near-projects.csv");
  const catalog = await readCSV("./dataset/local/awesome-bos-catalog.csv");
  const contracts = await readCSV("./dataset/local/awesome-near-contracts.csv");
  // const tokens = await readCSV("./dataset/local/awesome-near-tokens.csv");
  // const tokensToProject = await readCSV("./dataset/local/awesome-near-tokens-to-project.csv");

  const slugs = catalog
    .filter(
      (p) =>
        p.verified === "Y" &&
        p["source.awesomenear"] &&
        legacy[p["source.awesomenear"]]
    )
    .map((p) => p["source.awesomenear"]);

  console.log(`${slugs.length} projects to process`, slugs);

  const limit = 5;

  for (let start = 0; start < slugs.length; start += limit) {
    const processing = slugs.slice(start, start + limit);

    const uploadData: Record<string, any> = {};

    for (const slug of processing) {
      const project = projects.filter((p) => p.slug === slug)[0];
      if (project) {
        const transformed = awesomeNearProjectToNearSocial(project);
        const projectContracts = findContracts(slug, projects, contracts);
        if (projectContracts) {
          transformed.profile.contracts = projectContracts;
        }
        uploadData[slug] = transformed;
      } else {
        console.error("Missing project", slug);
      }
    }

    console.log(
      `${processing.length} projects to upload`,
      JSON.stringify(
        {
          data: {
            [legacyAwesomeNearAccountId]: {
              project: uploadData,
            },
          },
        },
        null,
        2
      )
    );

    console.log(
      `[${new Date(now).toISOString()}] Uploading Legacy Awesome NEAR data ...`
    );

    await contract.set({
      args: {
        data: {
          [legacyAwesomeNearAccountId]: {
            project: uploadData,
          },
        },
      },
      gas: Gas.parse("150 Tgas").toString(10),
      amount: NEAR.parse("0.5 NEAR").toString(10),
    });
  }
}
