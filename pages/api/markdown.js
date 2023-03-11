import { markdownToHTML } from "@/controller/parsing.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";


const router = createRouter();

router.use(auth).post(markdownToHTML)

export default router.handler({});
