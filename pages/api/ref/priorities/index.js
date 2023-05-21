import { createRouter } from "next-connect";
import {
  create,
  index,
} from "../../../../controller/ref_priorities.controller";
import auth from "../../../../middleware/auth.middleware";
import checkRole from "@/middleware/role.middleware";

const router = createRouter();

router.use(auth, checkRole("admin")).get(index).post(create);

export default router.handler();
