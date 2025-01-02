import { createRouter } from "next-connect";
import { getUnorSimaster } from "@/controller/rekon.controller";
import auth from "@/middleware/auth.middleware";

const router = createRouter();

router.use(auth).get(getUnorSimaster);

export default router.handler();
