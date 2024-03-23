const {
  detailSubmissionReference,
  updateSubmissionPersonInCharge,
  deleteSubmissionPersonInCharge,
} = require("@/controller/submissions.controller");
const adminMiddleware = require("@/middleware/admin.middleware");
const { default: auth } = require("@/middleware/auth.middleware");
const { createRouter } = require("next-connect");

const router = createRouter();
router
  .use(auth)
  .use(adminMiddleware)
  .get(detailSubmissionReference)
  .patch(updateSubmissionPersonInCharge)
  .delete(deleteSubmissionPersonInCharge);

module.exports = router.handler({});
