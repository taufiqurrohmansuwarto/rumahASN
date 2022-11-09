import { createRouter } from "next-connect";
import { excelReport } from "../../controller/report.controller";

const router = createRouter();

router.get(excelReport);

export default router.handler({});
