import { getPegawaiByNip } from "@/controller/pendataan-fasilitator.controller";
import { createRouter } from "next-connect";

const router = createRouter();
router.get(getPegawaiByNip);

export default router.handler({});
