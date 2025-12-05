import { getLabels, createLabel } from "@/controller/kanban/labels.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getLabels).post(createLabel);

export default router.handler({});

