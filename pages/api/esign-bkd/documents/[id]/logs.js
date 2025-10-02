import { getDocumentAuditLogs } from "@/controller/esign/esign-audit-log.controller";
import auth from "@/middleware/auth.middleware";
import onlyBkd from "@/middleware/bkd.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(onlyBkd).get(getDocumentAuditLogs);

export default router.handler({
  onError: (err, req, res) => {
    console.error("API Error:", err.stack);
    res.status(500).json({ message: "Internal Server Error" });
  },
});
