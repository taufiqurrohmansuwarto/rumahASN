import { publicUnorAsn } from "@/controller/pendataan-fasilitator.controller";
import { createRouter } from "next-connect";

const router = createRouter();
router.get(publicUnorAsn);

export default router.handler({});
