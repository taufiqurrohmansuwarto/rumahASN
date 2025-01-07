import { getJenisJabatanStatistics } from "@/controller/statistics.controller";
import { createRouter } from "next-connect";
const router = createRouter();

router.get(getJenisJabatanStatistics);

export default router.handler();
