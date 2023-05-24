import { createRouter } from "next-connect";
import { create, index } from "../../../../controller/faqs.controller";
import auth from "../../../../middleware/auth.middleware";
import checkRole from "@/middleware/role.middleware";
const router = createRouter();

router.use(auth).get(index).post(checkRole("admin"), create);

export default router.handler({});
