import { createRouter } from "next-connect";
import auth from "middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { testing } from "@/controller/siasn-instansi/token.controller";
import { siasnMiddleware } from "@/middleware/siasn.middleware";

const router = createRouter();

router
  .use(auth)
  .use(siasnMiddleware)
  .use(adminMiddleware)
  .get(testing)
  .post(createUsulanPeremajaan);

export default router.handler({});
