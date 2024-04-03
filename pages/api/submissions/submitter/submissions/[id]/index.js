const {
  detailSubmissionReferenceSubmitter,
} = require("@/controller/submissions.controller");
const asnFasilitatorMiddleware = require("@/middleware/asn-fasilitator.middleware");
const { default: auth } = require("@/middleware/auth.middleware");
const { createRouter } = require("next-connect");

const router = createRouter();
router
  .use(auth)
  .use(asnFasilitatorMiddleware)
  .get(detailSubmissionReferenceSubmitter);

module.exports = router.handler({});
