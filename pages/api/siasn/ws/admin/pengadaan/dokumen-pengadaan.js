import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { dokumenPengadaan } from "@/controller/siasn-pengadaan.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .use(siasnMiddleware)
  .get(dokumenPengadaan);

export default router.handler();
