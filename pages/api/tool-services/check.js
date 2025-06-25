import {
  checkApiKey,
  checkOrigin,
} from "@/middleware/tool-services.middleware";
import { createRouter } from "next-connect";

//middleware for check using api key

const router = createRouter();

router
  .use(checkApiKey)
  .use(checkOrigin)
  .get(async (req, res) => {
    res.json({
      message: "SPT Generated",
    });
  });

export default router.handler({});
