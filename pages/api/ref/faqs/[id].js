import { createRouter } from "next-connect";
import { detail, remove, update } from "../../../../controller/faqs.controller";
import auth from "../../../../middleware/auth.middleware";
import checkRole from "@/middleware/role.middleware";
const router = createRouter();

router
  .use(auth)
  .get(detail)
  .patch(checkRole("admin"), update)
  .delete(checkRole("admin"), remove);

export default router.handler({});
