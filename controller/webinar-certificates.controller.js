const WebinarParticipates = require("@/models/webinar-series-participates.model");
const WebinarSeries = require("@/models/webinar-series.model");
const {
  generateCertificateWithUserInformation,
} = require("@/utils/certificate-utils");
const { signWithNikAndPassphrase } = require("@/utils/esign-utils");

const LogBsre = require("@/models/log-seal-bsre.model");

const daftarCertificateSigner = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const employee_number = req.user.employee_number;

    const webinar = await WebinarSeries.query()
      .where({
        employee_number_signer: employee_number,
        status: "published",
        type_sign: "PERSONAL_SIGN",
        is_allow_download_certificate: true,
      })
      .page(page - 1, limit);

    const data = {
      data: webinar?.results,
      pagination: {
        total: webinar?.total,
        page,
        limit,
      },
    };

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const dataCertificateSignerByWebinarId = async (req, res) => {
  try {
    const webinar_id = req.query?.webinarId;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    // cek dulu webinar yang sudah berstatus published dan is_allow_download_certificate true
    const webinar = await WebinarSeries.query()
      .where({
        id: webinar_id,
        is_allow_download_certificate: true,
        status: "published",
        type_sign: "PERSONAL_SIGN",
      })
      .first();

    if (!webinar) {
      const data = {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
        },
      };
      res.json(data);
    } else {
      let total_generate = 0;
      const usersNeedToGenerate = await WebinarParticipates.query()
        .where("webinar_series_id", webinar_id)
        .andWhere("already_poll", true)
        .andWhereNot("user_information", null)
        .andWhere("document_sign", null)
        .orderBy("created_at", "asc");

      if (usersNeedToGenerate?.length > 0) {
        total_generate = usersNeedToGenerate?.length;
      }

      const webinarParticipates = await WebinarParticipates.query()
        .select(
          "id",
          "webinar_series_id",
          "user_id",
          "already_poll",
          "is_registered",
          "created_at",
          "updated_at",
          "is_generate_certificate",
          "document_sign_at",
          "user_information"
        )
        .andWhere("already_poll", true)
        .andWhereNot("user_information", null)
        .withGraphFetched("[participant(simpleSelect)]")
        .orderBy("created_at", "asc")
        .where({ webinar_series_id: webinar_id })
        .page(page - 1, limit);

      const data = {
        total_generate,
        data: webinarParticipates.results,
        total: webinarParticipates.total,
        page,
        limit,
      };

      res.json(data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const signCertificateByWebinarId = async (req, res) => {
  try {
    const webinar_id = req.query?.webinarId;
    const { employee_number } = req?.user;
    const { fetcher } = req;

    // get fucking nik
    const simasterEmployee = await fetcher.get(
      `/master-ws/operator/employees/${employee_number}/data-utama-master`
    );

    const nik = simasterEmployee?.data?.nik;
    const data = req?.body;

    // cek dulu webinar yang sudah berstatus published dan is_allow_download_certificate true
    const webinar = await WebinarSeries.query()
      .where({
        id: webinar_id,
        is_allow_download_certificate: true,
        status: "published",
        type_sign: "PERSONAL_SIGN",
      })
      .first();

    if (!webinar) {
      res.status(404).json({ message: "Webinar not found" });
    } else {
      // syarat ketika menggenerate certificate adalah belum poling user_information null dan document_sign
      const usersNeedToGenerate = await WebinarParticipates.query()
        .where("webinar_series_id", webinar_id)
        .andWhere("already_poll", true)
        .andWhereNot("user_information", null)
        .andWhere("document_sign", null)
        .orderBy("created_at", "asc");

      if (usersNeedToGenerate?.length === 0) {
        res.status(200).json({ message: "Success" });
      } else {
        const dataUser = usersNeedToGenerate?.map((user) => {
          return {
            url: webinar?.certificate_template,
            nomer_sertifikat: webinar?.certificate_number,
            id: user?.id,
            user: {
              nama: user?.user_information?.name,
              employee_number: user?.user_information?.employee_number,
              jabatan: user?.user_information?.jabatan,
              instansi: user?.user_information?.instansi,
            },
          };
        });

        const idUser = usersNeedToGenerate?.map((user) => user?.id);

        let promise = [];

        dataUser?.forEach((user) => {
          promise.push(generateCertificateWithUserInformation(user));
        });

        // using promise settle
        const result = await Promise.allSettled(promise);

        // check if all success
        const isAllSuccess = result?.every(
          (item) => item?.status === "fulfilled"
        );

        if (isAllSuccess) {
          const payload = {
            nik,
            passphrase: data?.passphrase,
          };

          const file = result?.map((item) => {
            return item?.value?.file;
          });

          const allPayload = {
            file,
            ...payload,
          };

          const hasil = await signWithNikAndPassphrase(allPayload);

          if (hasil?.success) {
            const files = hasil?.data?.file;

            idUser?.forEach(async (id, index) => {
              await WebinarParticipates.query().where("id", id).patch({
                document_sign: files[index],
                document_sign_at: new Date(),
                is_generate_certificate: true,
              });
            });

            await LogBsre.query().insert({
              user_id: req?.user?.customId,
              action: "SIGN_CERTIFICATE_PERSONAL",
              status: "SUCCESS",
              request_data: JSON.stringify(allPayload),
              response_data: JSON.stringify(hasil),
              description: "Sign certificate personal success",
            });

            res.status(200).json({ message: "Success" });
          } else {
            await LogBsre.query().insert({
              user_id: req?.user?.customId,
              action: "SIGN_CERTIFICATE_PERSONAL",
              status: "ERROR",
              request_data: JSON.stringify(allPayload),
              response_data: JSON.stringify(hasil),
              description: "Sign certificate personal error",
            });
            res.status(500).json({ message: hasil?.data?.error });
          }
        } else {
          res
            .status(500)
            .json({ message: "Template Sertifikat Belum diunggah" });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const signCertificateById = async (req, res) => {
  try {
    const webinar_participates_id = req?.query?.id;
    const data = {};
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  daftarCertificateSigner,
  dataCertificateSignerByWebinarId,
  signCertificateById,
  signCertificateByWebinarId,
};
