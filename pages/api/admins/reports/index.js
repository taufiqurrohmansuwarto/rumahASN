import { createRouter } from "next-connect";
import { excelReport } from "../../../../controller/report.controller";
import auth from "../../../../middleware/auth.middleware";

const router = createRouter();

router.use(auth).get(excelReport);

export default router.handler();
