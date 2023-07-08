import { activities } from "@/controller/activities.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(activities);

export default router.handler();
