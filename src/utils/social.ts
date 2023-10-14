import { initViewer } from "./helper";

export async function nearSocialGet(contractId: string, path: string) {
  const viewer = await initViewer();
  return viewer.viewFunctionV2({
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
