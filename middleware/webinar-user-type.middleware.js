const WebinarSeries = require("@/models/webinar-series.model");
const WebinarParticipates = require("@/models/webinar-series-participates.model");

const { typeGroup } = require("@/utils/index");

// untuk melakukan pengecekan setiap kali ada request ke endpoint webinar dengan cara mengecek apakah user yang melakukan request memiliki group yang sama dengan group webinar yang diakses

module.exports = async (req, res, next) => {
  try {
    const user = req?.user;
    const group = user?.group;
    const role = user?.role;

    const currentGroup = typeGroup(group, role);

    const { id } = req?.query;

    const currentWebinarParticipate = await WebinarParticipates.query()
      .where("user_id", user?.customId)
      .andWhere("id", id)
      .first();

    const webinar = await WebinarSeries.query()
      .where("id", currentWebinarParticipate?.webinar_series_id)
      // raw query untuk mencari webinar yang memiliki group yang sama dengan group user yang melakukan request
      .andWhereRaw(`type_participant::text LIKE '%${currentGroup}%'`)
      .first();

    if (!webinar) {
      return res.status(404).json({ code: 404, message: "Webinar not found" });
    } else {
      req.webinar = webinar;
      req.is_generate_certificate =
        currentWebinarParticipate?.is_generate_certificate;
      next();
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};
