import zoomMiddleware from "@/middleware/zoom.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(zoomMiddleware).post();

export default router.handler({});
