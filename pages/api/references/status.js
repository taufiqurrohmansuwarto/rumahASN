import { status } from "@/controller/references.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();
router.use(auth).get(status);

export default router.handler({});
