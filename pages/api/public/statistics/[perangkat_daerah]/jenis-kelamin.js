import { getJenisKelaminStatistics } from "@/controller/statistics.controller";
import { createRouter } from "next-connect";
const router = createRouter();

router.get(getJenisKelaminStatistics);

export default router.handler();
