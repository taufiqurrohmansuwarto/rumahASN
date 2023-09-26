import { getAllEmployeesMaster } from "@/controller/master-fasilitator.controller";
import auth from "@/middleware/auth.middleware";
import fasilitatorMasterMiddleware from "@/middleware/fasilitator-master.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(fasilitatorMasterMiddleware).get(getAllEmployeesMaster);

export default router.handler();
