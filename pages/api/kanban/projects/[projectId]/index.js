import {
  getProject,
  updateProject,
  deleteProject,
} from "@/controller/kanban/projects.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getProject).patch(updateProject).delete(deleteProject);

export default router.handler({});

