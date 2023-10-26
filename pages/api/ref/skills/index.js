import { createSkill, skillIndex } from "@/controller/skills.controller";
import auth from "@/middleware/auth.middleware";
import checkRole from "@/middleware/role.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth, checkRole("admin")).get(skillIndex).post(createSkill);

export default router.handler();
