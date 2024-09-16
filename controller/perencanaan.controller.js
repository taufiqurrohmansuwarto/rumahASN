const PerencanaanUsulan = require("@/models/perenc-usulan.model");
const PerencanaanUsulanDetail = require("@/models/perenc-usulan-detail.model");
const { getDetailOpd } = require("@/utils/server-utils");
const { uploadFileUsulan } = require("../utils");

const PerencanaanUsulanVerif = require("@/models/perenc-usulan-verif.model");

const getPerencanaanUsulan = async (req, res) => {
  try {
    const perencanaanUsulan = await PerencanaanUsulan.query()
      .orderBy("created_at", "desc")
      .withGraphFetched("[user(simpleSelect)]");

    res.json(perencanaanUsulan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPerencanaanUsulan = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      user_id: req.user.customId,
    };

    const perencanaanUsulan = await PerencanaanUsulan.query().insert(payload);

    res.json(perencanaanUsulan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePerencanaanUsulan = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      user_id: req.user.customId,
      is_active: true,
    };

    const perencanaanUsulan = await PerencanaanUsulan.query()
      .update(payload)
      .where("id", req?.query?.id);

    if (payload?.is_active) {
      await PerencanaanUsulan.query()
        .update({ is_active: false })
        .where("id", "!=", req?.query?.id);
    }

    res.json(perencanaanUsulan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePerencanaanUsulan = async (req, res) => {
  try {
    await PerencanaanUsulan.query().delete().where("id", req?.query?.id);
    res.json({ message: "Perencanaan usulan deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const adminPerencanaanUsulanDetail = async (req, res) => {
  const { id } = req?.query;
  try {
    const perencanaanUsulanDetail = await PerencanaanUsulanDetail.query()
      .where("perenc_usulan_id", id)
      .withGraphFetched("[unor, pendidikan, pelaksana,user(simpleSelect)]")
      .orderBy("created_at", "desc");

    let promises = perencanaanUsulanDetail.map((x) => {
      return getDetailOpd(x.simaster_skpd_id);
    });

    const detailOpd = await Promise.all(promises);

    const hasil = perencanaanUsulanDetail.map((x, index) => {
      return {
        ...x,
        detailOpd: detailOpd[index],
      };
    });
    res.json(hasil);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const userPerencanaan = async (req, res) => {
  try {
    const perencanaanUsulanDetail = await PerencanaanUsulan.query()
      .where("is_active", true)
      .withGraphFetched("[user(simpleSelect)]")
      .orderBy("created_at", "desc");
    res.json(perencanaanUsulanDetail);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const getPerencanaanUsulanDetail = async (req, res) => {
  try {
    const { id } = req?.query;
    const perencanaanUsulanDetail = await PerencanaanUsulanDetail.query()
      .where("perenc_usulan_id", id)
      .withGraphFetched("[unor, pendidikan, pelaksana]")
      .andWhere("user_id", req?.user?.customId)
      .orderBy("created_at", "desc");

    let promises = perencanaanUsulanDetail.map((x) => {
      return getDetailOpd(x.simaster_skpd_id);
    });

    const detailOpd = await Promise.all(promises);

    const hasil = perencanaanUsulanDetail.map((x, index) => {
      return {
        ...x,
        detailOpd: detailOpd[index],
      };
    });

    res.json(hasil);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPerencanaanUsulanDetail = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      user_id: req.user.customId,
      perenc_usulan_id: req?.query?.id,
    };

    const perencanaanUsulanDetail =
      await PerencanaanUsulanDetail.query().insert(payload);
    res.json(perencanaanUsulanDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePerencanaanUsulanDetail = async (req, res) => {
  try {
    const { id, detailId } = req?.query;
    const payload = {
      ...req.body,
      user_id: req.user.customId,
    };

    const perencanaanUsulanDetail = await PerencanaanUsulanDetail.query()
      .update(payload)
      .where("id", detailId)
      .andWhere("perenc_usulan_id", id)
      .andWhere("user_id", req?.user?.customId);
    res.json(perencanaanUsulanDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePerencanaanUsulanDetail = async (req, res) => {
  try {
    const { id, detailId } = req?.query;
    await PerencanaanUsulanDetail.query()
      .delete()
      .where("id", detailId)
      .andWhere("perenc_usulan_id", id)
      .andWhere("user_id", req?.user?.customId);

    res.json({ message: "Perencanaan usulan detail deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadPerencanaanUsulanDetail = async (req, res) => {
  try {
    const { file, mc } = req;
    const { id, detailId } = req?.query;

    const currentResult = await PerencanaanUsulanDetail.query().findById(
      detailId
    );

    const fileFormat = file?.mimetype?.split("/")[1];

    const fileName = `usulan-${currentResult?.key}.${fileFormat}`;
    await uploadFileUsulan(mc, fileName, file);
    await PerencanaanUsulanDetail.query()
      .patch({
        dokumen_usulan: fileName,
      })
      .where("id", detailId);

    res.json({ message: "Perencanaan usulan detail uploaded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// untuk verifikasi
const findPerencanaanUsulanVerif = async (req, res) => {
  try {
    const { id } = req?.query;
    const userId = req?.user?.customId;

    const perencanaanUsulanVerif = await PerencanaanUsulanVerif.query()
      .where("perenc_usulan_id", id)
      .andWhere("user_id", userId)
      .withGraphFetched("[perenc_detail]")
      .first();

    res.json(perencanaanUsulanVerif);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const createPerencanaanUsulanVerif = async (req, res) => {
  try {
    const { id } = req?.query;
    const userId = req?.user?.customId;
    const payload = {
      perenc_usulan_id: id,
      user_id: userId,
    };

    const perencanaanUsulanVerif = await PerencanaanUsulanVerif.query().insert(
      payload
    );
    res.json(perencanaanUsulanVerif);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePerencanaanUsulanVerif = async (req, res) => {
  try {
    const { id, verifId } = req?.query;
    const userId = req?.user?.customId;
    const payload = {
      ...req.body,
      user_id: userId,
    };

    const perencanaanUsulanVerif = await PerencanaanUsulanVerif.query()
      .patch(payload)
      .where("perenc_usulan_id", id)
      .andWhere("user_id", userId)
      .andWhere("id", verifId)
      .first();

    res.json(perencanaanUsulanVerif);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePerencanaanUsulanVerif = async (req, res) => {
  try {
    const { id, verifId } = req?.query;
    const userId = req?.user?.customId;

    await PerencanaanUsulanVerif.query()
      .delete()
      .where("perenc_usulan_id", id)
      .andWhere("user_id", userId)
      .andWhere("id", verifId);

    res.json({ message: "Perencanaan usulan verif deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPerencanaanUsulan,
  uploadPerencanaanUsulanDetail,
  createPerencanaanUsulan,
  updatePerencanaanUsulan,
  deletePerencanaanUsulan,
  getPerencanaanUsulanDetail,
  createPerencanaanUsulanDetail,
  updatePerencanaanUsulanDetail,
  deletePerencanaanUsulanDetail,
  adminPerencanaanUsulanDetail,
  userPerencanaan,
  findPerencanaanUsulanVerif,
  createPerencanaanUsulanVerif,
  updatePerencanaanUsulanVerif,
  deletePerencanaanUsulanVerif,
};
