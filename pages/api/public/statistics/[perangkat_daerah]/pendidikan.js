import { getPendidikanStatistics } from "@/controller/statistics.controller";
import { createRouter } from "next-connect";
const router = createRouter();

router.get(getPendidikanStatistics);

export default router.handler();
