const { handleError } = require("@/utils/helper/controller-helper");
const {
  getOpdIdFromUser,
} = require("@/utils/siasn-proxy/helpers/authorization-helper");
const {
  isChildOpd,
} = require("@/utils/siasn-proxy/helpers/opd-hierarchy-helper");

module.exports.getLaporanProgressMaster = async (req, res) => {
  try {
    const { fetcher } = req;
    const { opd_id } = req?.query;

    // Get current user's OPD ID
    const currentOpdId = getOpdIdFromUser(req?.user);

    // Use requested OPD ID or fall back to user's OPD ID
    const opdId = opd_id || currentOpdId;

    // Authorization check: user can only access their own OPD or child OPDs
    if (!isChildOpd(currentOpdId, opdId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource",
      });
    }

    // Fetch laporan progress data
    const result = await fetcher.get(
      `/master-ws/operator/departments/${opdId}/laporan-progress`
    );

    res.json(result?.data);
  } catch (error) {
    handleError(res, error);
  }
};
