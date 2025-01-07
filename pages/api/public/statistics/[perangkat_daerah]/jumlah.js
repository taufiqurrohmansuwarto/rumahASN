import { getJumlahStatistics } from "@/controller/statistics.controller";
import { createRouter } from "next-connect";
const router = createRouter();

router.get(getJumlahStatistics);

export default router.handler();
