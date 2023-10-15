import { BlockId } from "near-api-js/lib/providers/provider";
import { initViewer, writeCSV, config } from "./utils/helper";
import { nearSocialGet } from "./utils/social";

async function getProject(accountId: string, blockId: BlockId) {
  const viewer = await initViewer();
  console.log("Query project details of %s at block %s", accountId, blockId);
  const [horizonProject, nearSocialProfile] = await Promise.all([
    viewer.viewFunction({
      contractId: config.nearHorizonContractId,
      methodName: "get_project",
      args: {
        account_id: accountId,
      },
      blockQuery: { blockId },
    }),
    nearSocialGet(config.nearSocialContractId, `${accountId}/profile/**`),
  ]);
  const project = {
    id: accountId,
    ...nearSocialProfile[accountId]?.profile,
    ...horizonProject,
  };
  for (const key in project) {
    if (project[key] instanceof Object) {
      project[key] = JSON.stringify(project[key]);
    }
  }
  return project;
}

async function getProjects(contractId: string, blockId: BlockId) {
  const viewer = await initViewer();

  let index = 0;
  const limit = 500;
  const projects = [];

  while (true) {
    console.log(
      "Query projects of %s at block [%s]: %s -> %s",
      contractId,
      blockId,
      index,
      index + limit - 1
    );
    const projectIds = await viewer.viewFunction({
      contractId,
      methodName: "get_projects",
      args: {
        from_index: index,
        limit,
      },
      blockQuery: { blockId },
    });
    console.log(`Found ${projectIds.length} projects`);
    if (projectIds.length === 0) break;

    for (const projectId of projectIds) {
      const project = await getProject(projectId, blockId);
      projects.push(project);
    }
    index += limit;
  }
  return projects;
}

async function main() {
  const blockHeight = 103_326_151; // await getBlockHeightAt(Date.now());
  const projects = await getProjects(config.nearHorizonContractId, blockHeight);
  await writeCSV(`./dataset/local/near-horizon-projects.csv`, projects);
}

main();
