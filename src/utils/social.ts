import { initViewer } from "./helper";

export async function nearSocialGet(contractId: string, path: string) {
  const viewer = await initViewer();
  return viewer.viewFunction({
    contractId,
    methodName: "get",
    args: {
      keys: [path],
      options: {
        values_only: true,
        return_deleted: false,
      },
    },
    // blockQuery,
  });
}

export async function nearSocialKeys(contractId: string, path: string) {
  const viewer = await initViewer();
  return viewer.viewFunction({
    contractId,
    methodName: "keys",
    args: {
      keys: [path],
    },
    // blockQuery,
  });
}
