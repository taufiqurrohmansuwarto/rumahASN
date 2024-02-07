const AppBsreSeal = require("@/models/app_bsre_seal.model");
const {
  getSealActivationOTP,
  refreshSealTotp,
  refreshSealActivationTotp,
} = require("@/utils/esign-utils");
const { trim } = require("lodash");
const moment = require("moment");

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
        // merefresh kalau ada id_subscriber dan totp_activation_code
        const response = await refreshSealActivationTotp({
          idSubscriber: seal?.id_subscriber,
          totp: seal?.totp_activation_code,
        });
        if (response.success) {
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
          res.status(500).json({ message: response.data });
        }
      } else {
        const subscriberId = seal?.id_subscriber;
        const response = await getSealActivationOTP(subscriberId);
        if (response.success) {
          res.json(response?.data);
        } else {
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
      res.json({ message: "Seal ID has been set" });
    } else {
      await AppBsreSeal.query().patchAndFetchById(seal.id, data);
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
