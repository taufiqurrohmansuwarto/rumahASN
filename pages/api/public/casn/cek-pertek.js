import { cekPertekByNomerPeserta } from "@/controller/siasn-pengadaan.controller";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(siasnMiddleware).post(cekPertekByNomerPeserta);

export default router.handler();
