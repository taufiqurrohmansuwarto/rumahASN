import { indexPetugasBKD } from "@/controller/petugas-bkd.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(indexPetugasBKD);

export default router.handler({});