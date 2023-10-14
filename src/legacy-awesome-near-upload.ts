import { config } from "./utils/helper";
import { getNearContract } from "./utils/near";
import { Gas, NEAR } from "near-units";
import { nearSocialGet } from "./utils/social";

main().catch((e) => console.error(e));

async function main() {
  const now = Date.now();
  const { nearSocialContractId, legacyAwesomeNearAccountId } = config;

  const contract = (await getNearContract(
    nearSocialContractId,
    legacyAwesomeNearAccountId,
    ["get"],
    ["set"]
  )) as any;

  console.log(
    `[${new Date(now).toISOString()}] Uploading Legacy Awesome NEAR data ...`
  );

  await contract.set({
    args: {
      data: {
        [legacyAwesomeNearAccountId]: {
          project: {
            "ref-finance": {
              profile: {
                name: "Ref Finance",
                tagline: "Multi-purpose DeFi platform built on NEAR Protocol.",
                description:
                  "Ref Finance is a community-led, multi-purpose DeFi platform built on NEAR Protocol. Ref Finance takes full advantage of Near’s low fees, one-to-two second finality, and WebAssembly-based runtime (hello, Rust smart contracts!).\n\nIn addition to the advantages of being built on top of NEAR, Ref Finance provides:\n\n- Multiple pools in one contract\n- Atomic transactions\n- Customisable pool fee",
                image:
                  "https://web.archive.org/web/20230521202119/https://awesomenear-spaces.fra1.digitaloceanspaces.com/production/projects/ref-finance/ref-finance.jpg",
                tags: {
                  AURORA: "",
                  DAPPS: "",
                  DEFI: "",
                  DEX: "",
                  EXCHANGES: "",
                },
                dapp: "https://app.ref.finance",
                linktree: {
                  website: "https://ref.finance",
                  twitter: "https://twitter.com/finance_ref",
                  medium: "https://ref-finance.medium.com",
                  telegram: "https://t.me/ref_finance",
                  discord: "",
                  github: "https://github.com/ref-finance",
                },
              },
            },
          },
        },
      },
    },
    gas: Gas.parse("150 Tgas").toString(10),
    amount: NEAR.parse("0.1 NEAR").toString(10),
  });

  // NEAR_ENV=mainnet near view social.near get '{"keys":["legacy-awesome.near/project/**"]}'
  const data = await nearSocialGet(
    nearSocialContractId,
    `${legacyAwesomeNearAccountId}/project/**`
  ); //
  console.log("Legacy Awesome NEAR Data", JSON.stringify(data, null, 2));
}
