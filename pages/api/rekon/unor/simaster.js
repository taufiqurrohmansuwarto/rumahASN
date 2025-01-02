import { createRouter } from "next-connect";
import { getUnorSimaster } from "@/controller/rekon.controller";
import auth from "@/middleware/auth";

const router = createRouter();

router.use().get(getUnorSimaster);

export default router.handler();
