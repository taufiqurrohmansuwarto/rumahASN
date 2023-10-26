import { destroySkill, updateSkill } from "@/controller/skills.controller";
import auth from "@/middleware/auth.middleware";
import checkRole from "@/middleware/role.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth, checkRole("admin"))
  .get()
  .delete(destroySkill)
  .patch(updateSkill);

export default router.handler();
