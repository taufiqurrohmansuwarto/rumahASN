import { getGolonganStatistics } from "@/controller/statistics.controller";
import { createRouter } from "next-connect";
const router = createRouter();

router.get(getGolonganStatistics);

export default router.handler();
