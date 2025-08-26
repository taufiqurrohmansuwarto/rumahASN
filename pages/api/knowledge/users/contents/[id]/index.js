import { createRouter } from "next-connect";
import { getKnowledgeContent, updateKnowledgeContentPersonal } from "@/controller/knowledge/knowledge-contents.controller";
import auth from "@/middleware/auth.middleware";

const router = createRouter();

router.use(auth).get(getKnowledgeContent).patch(updateKnowledgeContentPersonal);

export default router.handler({});
