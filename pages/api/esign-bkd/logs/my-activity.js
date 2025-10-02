import { getMyActivityLogs } from "../../../../../controller/esign/esign-audit-log.controller";
import auth from "../../../../../middleware/auth";
import nc from "next-connect";

const handler = nc()
  .use(auth)
  .get(getMyActivityLogs);

export default handler;
