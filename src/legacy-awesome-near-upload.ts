import { config, readCSV } from "./utils/helper";
// import { getNearContract } from "./utils/near";
import { nearSocialGet } from "./utils/social";

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
  contract?: Contracts;
  token?: Tokens;
  team?: number;
  validator?: Validators;
  investor?: Investors;
  grants?: Grants;
}

interface AwesomeNearProject {
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
  // NEAR_ENV=mainnet near view social.near get '{"keys":["legacy-awesome.near/project/**"]}'
  const data = await nearSocialGet(
    config.nearSocialContractId,
    `${config.legacyAwesomeNearAccountId}/project/**`
  );
  return data[config.legacyAwesomeNearAccountId].project;
}

async function main() {
  const now = Date.now();
  // const { nearSocialContractId, legacyAwesomeNearAccountId } = config;

  // const contract = (await getNearContract(
  //   nearSocialContractId,
  //   legacyAwesomeNearAccountId,
  //   ["get"],
  //   ["set"]
  // )) as any;

  const legacy = await queryLegacyAwesomeNEAR();

  console.log("legacy", legacy);

  const projects = await readCSV("./dataset/local/awesome-near-projects.csv");

  const catalog = await readCSV("./dataset/local/awesome-bos-catalog.csv");
  const slugs = catalog
    .filter(
      (p) => p.verified === "Y" && p["source.awesomenear"] && !legacy[p.slug]
    )
    .map((p) => p["source.awesomenear"]);

  console.log(
    `${slugs.length} projects to process`,
    slugs,
    legacy["ref-finance"]
  );

  const limit = 5;

  for (let start = 0; start < slugs.length; start += limit) {
    const processing = slugs.slice(start, start + limit);

    const uploadData: Record<string, any> = {};

    for (const slug of processing) {
      const project = projects.filter((p) => p.slug === slug)[0];
      const transformed = awesomeNearProjectToNearSocial(project);
      uploadData[slug] = transformed;
    }

    console.log(`${processing.length} projects to upload`, uploadData);

    console.log(
      `[${new Date(now).toISOString()}] Uploading Legacy Awesome NEAR data ...`
    );

    // await contract.set({
    //   args: {
    //     data: {
    //       [legacyAwesomeNearAccountId]: {
    //         project: {
    //           "ref-finance": {
    //              {
    //               name: "Ref Finance",
    //               tagline: "Multi-purpose DeFi platform built on NEAR Protocol.",
    //               description:
    //                 "Ref Finance is a community-led, multi-purpose DeFi platform built on NEAR Protocol. Ref Finance takes full advantage of Near’s low fees, one-to-two second finality, and WebAssembly-based runtime (hello, Rust smart contracts!).\n\nIn addition to the advantages of being built on top of NEAR, Ref Finance provides:\n\n- Multiple pools in one contract\n- Atomic transactions\n- Customisable pool fee",
    //               image:
    //                 "https://web.archive.org/web/20230521202119/https://awesomenear-spaces.fra1.digitaloceanspaces.com/production/projects/ref-finance/ref-finance.jpg",
    //               tags: {
    //                 AURORA: "",
    //                 DAPPS: "",
    //                 DEFI: "",
    //                 DEX: "",
    //                 EXCHANGES: "",
    //               },
    //               dapp: "https://app.ref.finance",
    //               linktree: {
    //                 website: "https://ref.finance",
    //                 twitter: "https://twitter.com/finance_ref",
    //                 medium: "https://ref-finance.medium.com",
    //                 telegram: "https://t.me/ref_finance",
    //                 discord: "",
    //                 github: "https://github.com/ref-finance",
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    //   gas: Gas.parse("150 Tgas").toString(10),
    //   amount: NEAR.parse("0.1 NEAR").toString(10),
    // });
  }

  // await contract.set({
  //   args: {
  //     data: {
  //       [legacyAwesomeNearAccountId]: {
  //         project: {
  //           "ref-finance": {
  //             name: "Ref Finance",
  //             tagline: "Multi-purpose DeFi platform built on NEAR Protocol.",
  //             description:
  //               "Ref Finance is a community-led, multi-purpose DeFi platform built on NEAR Protocol. Ref Finance takes full advantage of Near’s low fees, one-to-two second finality, and WebAssembly-based runtime (hello, Rust smart contracts!).\n\nIn addition to the advantages of being built on top of NEAR, Ref Finance provides:\n\n- Multiple pools in one contract\n- Atomic transactions\n- Customisable pool fee",
  //             image: {
  //               url: "https://web.archive.org/web/20230521202108im_/https://awesomenear-spaces.fra1.digitaloceanspaces.com/production/projects/ref-finance/ref-finance.jpg"
  //             },
  //             tags: {
  //               AURORA: "",
  //               DAPPS: "",
  //               DEFI: "",
  //               DEX: "",
  //               EXCHANGES: "",
  //             },
  //             dapp: "https://app.ref.finance",
  //             linktree: {
  //               website: "https://ref.finance",
  //               twitter: "https://twitter.com/finance_ref",
  //               medium: "https://ref-finance.medium.com",
  //               telegram: "https://t.me/ref_finance",
  //               discord: "",
  //               github: "https://github.com/ref-finance",
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  //   gas: Gas.parse("150 Tgas").toString(10),
  //   // amount: NEAR.parse("0.1 NEAR").toString(10),
  // });

  // console.log("Legacy Awesome NEAR Data", JSON.stringify(data, null, 2));
}
