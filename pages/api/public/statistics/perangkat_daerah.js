import { getPerangkatDaerah } from "@/controller/statistics.controller";
import { createRouter } from "next-connect";
const router = createRouter();

router.get(getPerangkatDaerah);

export default router.handler();
