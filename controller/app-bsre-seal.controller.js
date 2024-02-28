const AppBsreSeal = require("@/models/app_bsre_seal.model");
const {
  getSealActivationOTP,
  refreshSealTotp,
  refreshSealActivationTotp,
} = require("@/utils/esign-utils");
const { trim } = require("lodash");
const moment = require("moment");
const LogSealBsre = require("@/models/log-seal-bsre.model");

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
      res.status(404).json({ message: "Seal Information not found" });
    } else {
      if (seal?.id_subscriber && seal?.totp_activation_code) {
        const response = await refreshSealActivationTotp({
          idSubscriber: seal?.id_subscriber,
          totp: seal?.totp_activation_code,
        });

        if (response.success) {
          // create log
          await LogSealBsre.query().insert({
            user_id: req?.user?.customId,
            action: "REFRESH_SEAL_OTP",
            status: "SUCCESS",
            request_data: JSON.stringify({
              idSubscriber: seal?.id_subscriber,
              totp: seal?.totp_activation_code,
            }),
            response_data: JSON.stringify(response),
            description: "Refresh Seal OTP",
          });

          const data = response?.data;
          await AppBsreSeal.query().patchAndFetchById(seal.id, {
            totp_activation_code: trim(data?.totp),
          });

          const result = {
            ...data,
            expired_at: moment(data?.expires).format("DD-MM-YYYY HH:mm:ss"),
            expire_from_now_in_hours: moment(data?.expires).diff(
              moment(),
              "hours"
            ),
          };

          res.json(result);
        } else {
          console.log({
            type: "ERROR REFRESH_SEAL_OTP",
            response,
          });
          await LogSealBsre.query().insert({
            user_id: req?.user?.customId,
            action: "REFRESH_SEAL_OTP",
            status: "ERROR",
            request_data: JSON.stringify({
              idSubscriber: seal?.id_subscriber,
              totp: seal?.totp_activation_code,
            }),
            response_data: JSON.stringify(response),
            description: "Refresh Seal OTP",
          });
          res.status(500).json({ message: response.data });
        }
      } else {
        const subscriberId = seal?.id_subscriber;
        const response = await getSealActivationOTP(subscriberId);
        if (response.success) {
          // create log
          await LogSealBsre.query().insert({
            user_id: req?.user?.customId,
            action: "GENERATE_SEAL_OTP",
            status: "SUCCESS",
            request_data: JSON.stringify({ subscriberId }),
            response_data: JSON.stringify(response),
            description: "Generate Seal OTP",
          });
          res.json(response?.data);
        } else {
          console.log({
            type: "ERROR GENERATE_SEAL_OTP",
            response,
          });
          await LogSealBsre.query().insert({
            user_id: req?.user?.customId,
            action: "GENERATE_SEAL_OTP",
            status: "ERROR",
            request_data: JSON.stringify({ subscriberId }),
            response_data: JSON.stringify(response),
            description: "Generate Seal OTP",
          });
          res.status(500).json({ message: response.data });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
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
