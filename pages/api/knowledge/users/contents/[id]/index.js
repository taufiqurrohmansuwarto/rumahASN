import { createRouter } from "next-connect";
import auth from "@/middlewares/auth.middleware";
import { getKnowledgeContent } from "@/controller/knowledge/knowledge-contents.controller";

const router = createRouter();

router.use(auth).get(getKnowledgeContent);

export default router.handler({});
