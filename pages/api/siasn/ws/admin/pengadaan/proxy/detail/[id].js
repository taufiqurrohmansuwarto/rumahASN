import {
  detailPengadaanProxy,
  usulkanPengadaanProxy,
} from "@/controller/siasn-pengadaan.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(siasnMiddleware)
  .use(adminMiddleware)
  .get(detailPengadaanProxy)
  .post(usulkanPengadaanProxy);

export default router.handler();
