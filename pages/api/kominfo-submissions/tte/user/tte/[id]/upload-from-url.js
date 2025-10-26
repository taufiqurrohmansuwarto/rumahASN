import { uploadFileFromUrl } from "@/controller/tte-submission/tte-submission.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).post(uploadFileFromUrl);

export default router.handler({});
