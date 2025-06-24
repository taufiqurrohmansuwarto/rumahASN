const AppBsreSeal = require("../../models/app_bsre_seal.model");
const { refreshSealActivationTotp } = require("../../utils/esign-utils");

async function refreshTotp(job) {
  console.log("🔄 Refreshing TOTP...");

  const result = await AppBsreSeal.query().first();
  if (!result) {
    return { status: "no_data" };
  }

  const { id_subscriber, totp_activation_code } = result;
  const response = await refreshSealActivationTotp({
    idSubscriber: id_subscriber,
    totp: totp_activation_code,
  });

  if (response?.success && response?.data?.totp) {
    await AppBsreSeal.query().patchAndFetchById(result.id, {
      totp_activation_code: response.data.totp,
    });
    return { status: "success", newTotp: response.data.totp };
  }

  throw new Error("Failed to refresh TOTP");
}

module.exports = {
  refreshTotp,
};
