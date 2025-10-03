import { createRouter } from "next-connect";
import { checkQr } from "@/controller/esign/esign.controller";

const router = createRouter();

router.get(checkQr);

export default router.handler();
