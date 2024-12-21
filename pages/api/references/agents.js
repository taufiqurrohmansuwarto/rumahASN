import { agents } from "@/controller/references.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(auth).get(agents);

export default router.handler({});
