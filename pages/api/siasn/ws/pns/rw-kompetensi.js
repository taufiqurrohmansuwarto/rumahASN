import { createRouter } from "next-connect";
import { getKompetensi } from "@/controller/pengkom-pegawai.controller";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import auth from "@/middleware/auth.middleware";
const router = createRouter();

router.use(auth).use(siasnMiddleware).get(getKompetensi);

export default router.handler({});
