const { loadEnv } = require("../utils/load-env");
loadEnv();

const { refreshSealActivationTotp } = require("../../utils/esign-utils");
const AppBsreSeal = require("../../models/app_bsre_seal.model");

async function refreshTotp() {
  console.log("🔄 Refreshing TOTP...");

  try {
    const result = await AppBsreSeal.query().first();
    if (!result) {
      console.log("❌ No BSRE seal data found");
      return { status: "no_data" };
    }

    const { id_subscriber, totp_activation_code } = result;
    console.log(
      "🔄 Processing TOTP refresh for subscriber:",
      id_subscriber,
      totp_activation_code
    );

    const response = await refreshSealActivationTotp({
      idSubscriber: id_subscriber,
      totp: totp_activation_code,
    });

    console.log("🔄 Response:", response);

    if (response?.success && response?.data?.totp) {
      await AppBsreSeal.query().patchAndFetchById(result.id, {
        totp_activation_code: response.data.totp,
      });
      console.log("✅ TOTP refreshed successfully");
      return { status: "success", newTotp: response.data.totp };
    }

    console.log("❌ Failed to refresh TOTP - invalid response");
    throw new Error("Failed to refresh TOTP - invalid response");
  } catch (error) {
    console.error("❌ Error refreshing TOTP:", error.message);
    throw error;
  }
}

module.exports = {
  refreshTotp,
};
