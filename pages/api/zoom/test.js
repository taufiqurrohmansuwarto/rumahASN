import { zoomIndex } from "@/controller/zoom.controller";
import zoomMiddleware from "@/middleware/zoom.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(zoomMiddleware).get(zoomIndex);

export default router.handler();
