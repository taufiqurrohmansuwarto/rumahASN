const {
  detailSubmissionReference,
  updateSubmissionReference,
  deleteSubmissionReference,
} = require("@/controller/submissions.controller");
const adminMiddleware = require("@/middleware/admin.middleware");
const { default: auth } = require("@/middleware/auth.middleware");
const { createRouter } = require("next-connect");

const router = createRouter();
router
  .use(auth)
  .use(adminMiddleware)
  .get(detailSubmissionReference)
  .patch(updateSubmissionReference)
  .delete(deleteSubmissionReference);

export default router.handler({});
