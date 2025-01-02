import { getRekonUnor } from "@/controller/rekon.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getRekonUnor);

export default router.handler();
