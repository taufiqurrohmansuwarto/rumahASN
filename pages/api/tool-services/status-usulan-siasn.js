import { checkUsulan } from "@/controller/tool-services.controller";
import { checkRole } from "@/middleware/tool-services.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(checkRole).post(checkUsulan);

export default router.handler({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).end("Something broke!");
  },
});