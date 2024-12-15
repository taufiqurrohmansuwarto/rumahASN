import { getCurrentUser } from "@/controller/tool-services.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getCurrentUser);

export default router.handler();
