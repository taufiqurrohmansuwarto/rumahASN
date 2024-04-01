const {
  createSubmissions,
  detailSubmission,
} = require("@/controller/submissions.controller");
const adminFasilitatorAsnMiddleware = require("@/middleware/admin-fasilitator-asn.middleware");
const adminMiddleware = require("@/middleware/admin.middleware");
const { default: auth } = require("@/middleware/auth.middleware");
const { createRouter } = require("next-connect");

const router = createRouter();
router.use(auth).use(adminFasilitatorAsnMiddleware).get(detailSubmission);

module.exports = router.handler({});
