import { createRouter } from "next-connect";
import { adminReportController } from "../../controller/report.controller";

const router = createRouter();

router.get(adminReportController);

export default router.handler({});
