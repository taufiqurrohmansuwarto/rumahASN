import { landingPageData } from "@/controller/public.controller";
import { createRouter } from "next-connect";
const router = createRouter();

router.get(landingPageData);

export default router.handler();
