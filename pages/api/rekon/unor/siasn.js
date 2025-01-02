import { createRouter } from "next-connect";
import { getUnorSiasn } from "@/controller/rekon.controller";

const router = createRouter();

router.get(getUnorSiasn);

export default router.handler();
