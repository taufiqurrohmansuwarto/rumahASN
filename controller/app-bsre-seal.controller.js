const AppBsreSeal = require("@/models/app_bsre_seal.model");
const {
  getSealActivationOTP,
  refreshSealTotp,
  refreshSealActivationTotp,
} = require("@/utils/esign-utils");
const { trim } = require("lodash");
const LogSealBsre = require("@/models/log-seal-bsre.model");

const dayjs = require("dayjs");
require("dayjs/locale/id");
dayjs.locale("id");

const subscribersDetail = async (req, res) => {
  try {
    const seal = await AppBsreSeal.query();
    res.json(seal);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const generateSealActivation = async (req, res) => {
  try {
    const seal = await AppBsreSeal.query().first();

    if (!seal) {
      return res.status(404).json({ message: "Seal Information not found" });
    }

    // Jika id_subscriber dan totp_activation_code sudah ada, refresh TOTP
    if (seal?.id_subscriber && seal?.totp_activation_code) {
      try {
        const response = await refreshSealActivationTotp({
          idSubscriber: seal.id_subscriber,
          totp: seal.totp_activation_code,
        });

        // Log untuk tracking
        const logData = {
          user_id: req?.user?.customId,
          action: "REFRESH_SEAL_OTP",
          status: response.success ? "SUCCESS" : "ERROR",
          request_data: JSON.stringify({
            idSubscriber: seal.id_subscriber,
            totp: seal.totp_activation_code,
          }),
          response_data: JSON.stringify(response),
          description: "Refresh Seal OTP",
        };
        await LogSealBsre.query().insert(logData);

        if (!response.success) {
          console.error({
            type: "ERROR REFRESH_SEAL_OTP",
            response,
          });
          return res
            .status(500)
            .json({ message: response.data || "Gagal refresh TOTP" });
        }

        const data = response.data;
        await AppBsreSeal.query().patchAndFetchById(seal.id, {
          totp_activation_code: trim(data?.totp),
        });

        const result = {
          ...data,
          expired_at: dayjs(data?.expires).format("DD-MM-YYYY HH:mm:ss"),
          expire_from_now_in_hours: dayjs(data?.expires).diff(dayjs(), "hours"),
        };

        return res.json(result);
      } catch (refreshError) {
        console.error("Error refreshing TOTP:", refreshError);
        return res.status(500).json({ message: "Gagal memperbarui TOTP" });
      }
    } else {
      // Jika belum ada TOTP, generate baru
      if (!seal?.id_subscriber) {
        return res
          .status(400)
          .json({ message: "ID Subscriber tidak ditemukan" });
      }

      try {
        const subscriberId = seal.id_subscriber;
        const response = await getSealActivationOTP(subscriberId);

        // Log untuk tracking
        const logData = {
          user_id: req?.user?.customId,
          action: "GENERATE_SEAL_OTP",
          status: response.success ? "SUCCESS" : "ERROR",
          request_data: JSON.stringify({ subscriberId }),
          response_data: JSON.stringify(response),
          description: "Generate Seal OTP",
        };
        await LogSealBsre.query().insert(logData);

        if (!response.success) {
          console.error({
            type: "ERROR GENERATE_SEAL_OTP",
            response,
          });
          return res
            .status(500)
            .json({ message: response.data || "Gagal generate OTP" });
        }

        // Simpan TOTP yang baru dibuat
        if (response.data?.totp) {
          await AppBsreSeal.query().patchAndFetchById(seal.id, {
            totp_activation_code: trim(response.data.totp),
          });
        }

        return res.json(response.data);
      } catch (generateError) {
        console.error("Error generating OTP:", generateError);
        return res.status(500).json({ message: "Gagal membuat OTP baru" });
      }
    }
  } catch (error) {
    console.error("Error in generateSealActivation:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const setIdSubscriber = async (req, res) => {
  try {
    const data = req.body;

    const seal = await AppBsreSeal.query().first();

    if (!seal) {
      await AppBsreSeal.query().insert(data);
      await LogSealBsre.query().insert({
        user_id: req?.user?.customId,
        action: "SET_ID_SUBSCRIBER",
        status: "SUCCESS",
        request_data: JSON.stringify(data),
        response_data: JSON.stringify({ message: "ID subscriber has ben set" }),
        description: "Set ID Subscriber",
      });

      res.json({ message: "Seal ID has been set" });
    } else {
      await AppBsreSeal.query().patchAndFetchById(seal.id, data);
      await LogSealBsre.query().insert({
        user_id: req?.user?.customId,
        action: "SET_ID_SUBSCRIBER",
        status: "SUCCESS",
        request_data: JSON.stringify(data),
        response_data: JSON.stringify({
          message: "ID subscriber has ben updated",
        }),
        description: "Set ID Subscriber",
      });
      res.json({ message: "Seal ID has been updated" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const setTotpActivationCode = async (req, res) => {
  try {
    const data = req.body;

    const seal = await AppBsreSeal.query().first();

    if (!seal) {
      res.status(404).json({ error: "Seal ID not found" });
    } else {
      await AppBsreSeal.query().patchAndFetchById(seal.id, data);
      await LogSealBsre.query().insert({
        user_id: req?.user?.customId,
        action: "SET_TOTP_ACTIVATION_CODE",
        status: "SUCCESS",
        request_data: JSON.stringify(data),
        response_data: JSON.stringify({
          message: "Seal activation code has been set",
        }),
        description: "Set TOTP Activation Code",
      });
      res.json({ message: "Seal activation code has been set" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const refreshSealActivation = async (req, res) => {
  try {
    const seal = await AppBsreSeal.query().first();

    if (!seal) {
      res.status(404).json({ error: "Seal ID not found" });
    } else {
      const idSubscriber = seal?.id_subscriber;
      const totp = seal?.totp_activation_code;
      const response = await refreshSealTotp({
        idSubscriber,
        totp,
      });

      if (response.success) {
        await AppBsreSeal.query().patchAndFetchById(seal.id, {
          totp_activation_code: response.data,
        });
        res.json({ message: "Seal activation code has been refreshed" });
      } else {
        res.json({ message: response.data });
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  generateSealActivation,
  setIdSubscriber,
  refreshSealActivation,
  setTotpActivationCode,
  subscribersDetail,
};
