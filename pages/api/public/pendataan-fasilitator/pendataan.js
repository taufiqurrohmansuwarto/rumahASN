import { postPendataan } from "@/controller/pendataan-fasilitator.controller";
import { createRouter } from "next-connect";

const router = createRouter();
router.post(postPendataan);

export default router.handler({});
