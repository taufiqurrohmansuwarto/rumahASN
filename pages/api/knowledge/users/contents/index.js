import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import {
  createKnowledgeContent,
  getKnowledgeContents,
} from "@/controller/knowledge/knowledge-contents.controller";

const router = createRouter();

router.use(auth).get(getKnowledgeContents).post(createKnowledgeContent);

export default router.handler({});
