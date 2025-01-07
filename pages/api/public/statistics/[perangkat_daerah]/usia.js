import { getUsiaStatistics } from "@/controller/statistics.controller";
import { createRouter } from "next-connect";
const router = createRouter();

router.get(getUsiaStatistics);

export default router.handler();
