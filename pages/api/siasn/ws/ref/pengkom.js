import {
  getPengkom,
  createRefKegiatanPengkom,
} from "@/controller/pengkom.controller";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(siasnMiddleware).get(getPengkom).post(createRefKegiatanPengkom);

export default router.handler();
