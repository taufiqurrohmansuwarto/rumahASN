import { log, logger } from "@/utils/logger";

const { handleError } = require("@/utils/helper/controller-helper");
const P3KParuhWaktu = require("@/models/pengadaan/p3k-paruh-waktu.model");
const OperatorGajiPW = require("@/models/pengadaan/operator-gaji-pw.model");
const AuditLog = require("@/models/pengadaan/audit-log.model");
const { operatorVerifyMfa } = require("@/utils/master.utils");

export const getPengadaanParuhWaktu = async (req, res) => {
  try {
    const { current_role, organization_id: skpd_id } = req?.user;

    const {
      limit = 10,
      page = 1,
      opd_id,
      nama = "",
      nip = "",
      no_peserta = "",
      unor_type = "simaster", // "simaster" or "pk"
      min_gaji,
      max_gaji,
      is_blud,
      luar_perangkat_daerah,
      unor_match, // "same" or "different"
    } = req?.query;

    const currentOperator = await OperatorGajiPW.query()
      .where("user_id", req?.user?.customId)
      .first();

    const unorId = currentOperator?.unor_id;

    // Determine OPD ID based on user role
    // Admin can access all OPDs (starts with "1")
    // Non-admin can only access their own OPD and its children (e.g., 123 can access 123, 1231, 1232, etc.)
    const opdIdFilter = opd_id || (current_role === "admin" ? "1" : skpd_id);

    // Authorization check: non-admin users can only access their own OPD or its children
    if (current_role !== "admin") {
      if (!opdIdFilter.startsWith(skpd_id)) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden: You can only access your own OPD or its children",
        });
      }
    }

    // Build base query
    const baseQuery = P3KParuhWaktu.query()
      .select(
        "*",
        "unor_siasn_text as unor_siasn",
        "unor_simaster_text as unor_simaster"
      )
      .where((builder) => {
        builder.where("unor_id_simaster", "ILIKE", `${opdIdFilter}%`);
      })
      .where((builder) => {
        if (nama) {
          builder.where("nama", "ILIKE", `%${nama}%`);
        }
        if (nip) {
          builder.where("nip", "ILIKE", `%${nip}%`);
        }
        if (no_peserta) {
          builder.where("no_peserta", "ILIKE", `%${no_peserta}%`);
        }
        if (min_gaji) {
          builder.where("gaji", ">=", Number(min_gaji));
        }
        if (max_gaji) {
          builder.where("gaji", "<=", Number(max_gaji));
        }
        if (is_blud !== undefined) {
          builder.where("is_blud", is_blud === "true" || is_blud === true);
        }
        if (luar_perangkat_daerah !== undefined) {
          builder.where(
            "luar_perangkat_daerah",
            luar_perangkat_daerah === "true" || luar_perangkat_daerah === true
          );
        }
        if (unor_match === "same") {
          builder.whereRaw("unor_pk = unor_id_simaster");
        } else if (unor_match === "different") {
          builder.whereRaw("unor_pk != unor_id_simaster OR unor_pk IS NULL");
        }
      })
      .withGraphFetched("[detail, status_usulan]")
      .orderBy("nama", "asc");

    // Check if limit = -1 for downloading all data
    if (Number(limit) === -1) {
      const result = await baseQuery;

      // Process data: check if operator has access and sensor gaji
      const processedData = result.map((item) => {
        // Check if unor_pk matches unor_id_simaster
        const unorIsMatch =
          item.unor_pk && item.unor_id_simaster
            ? item.unor_pk === item.unor_id_simaster
            : null;

        // Admin can see all gaji but has_action is false
        if (current_role === "admin") {
          return {
            ...item,
            unor_is_match: unorIsMatch,
            // Gaji tetap ditampilkan untuk admin
          };
        }

        // For non-admin: check operator access
        const unorFieldToCheck =
          unor_type === "pk" ? item.unor_pk : item.unor_id_simaster;

        const hasAccess =
          currentOperator &&
          unorId &&
          unorFieldToCheck &&
          String(unorFieldToCheck).startsWith(String(unorId));

        return {
          ...item,
          unor_is_match: unorIsMatch,
          gaji: hasAccess ? item.gaji : "***", // Sensor gaji jika tidak ada akses
        };
      });

      // Calculate total gaji using SQL
      const knex = P3KParuhWaktu.knex();
      let totalGaji = 0;

      if (current_role === "admin") {
        // Admin: SUM semua gaji
        const totalResult = await knex("pengadaan.p3k_paruh_waktu")
          .where("unor_id_simaster", "ILIKE", `${opdIdFilter}%`)
          .where((builder) => {
            if (nama) {
              builder.where("nama", "ILIKE", `%${nama}%`);
            }
            if (nip) {
              builder.where("nip", "ILIKE", `%${nip}%`);
            }
            if (no_peserta) {
              builder.where("no_peserta", "ILIKE", `%${no_peserta}%`);
            }
            if (min_gaji) {
              builder.where("gaji", ">=", Number(min_gaji));
            }
            if (max_gaji) {
              builder.where("gaji", "<=", Number(max_gaji));
            }
          })
          .sum("gaji as total")
          .first();

        totalGaji = Number(totalResult?.total || 0);
      } else if (currentOperator && unorId) {
        // Non-admin: SUM gaji yang memiliki akses
        const unorField = unor_type === "pk" ? "unor_pk" : "unor_id_simaster";
        const totalResult = await knex("pengadaan.p3k_paruh_waktu")
          .where("unor_id_simaster", "ILIKE", `${opdIdFilter}%`)
          .where(unorField, "ILIKE", `${unorId}%`)
          .where((builder) => {
            if (nama) {
              builder.where("nama", "ILIKE", `%${nama}%`);
            }
            if (nip) {
              builder.where("nip", "ILIKE", `%${nip}%`);
            }
            if (no_peserta) {
              builder.where("no_peserta", "ILIKE", `%${no_peserta}%`);
            }
            if (min_gaji) {
              builder.where("gaji", ">=", Number(min_gaji));
            }
            if (max_gaji) {
              builder.where("gaji", "<=", Number(max_gaji));
            }
          })
          .sum("gaji as total")
          .first();

        totalGaji = Number(totalResult?.total || 0);
      }

      // Check if operator has action (can access any data)
      // Admin always has has_action: false
      let hasAction = false;
      if (current_role !== "admin") {
        hasAction =
          currentOperator &&
          unorId &&
          processedData.some((item) => {
            const unorFieldToCheck =
              unor_type === "pk" ? item.unor_pk : item.unor_id_simaster;
            return (
              unorFieldToCheck &&
              String(unorFieldToCheck).startsWith(String(unorId))
            );
          });
      }

      return res.json({
        success: true,
        total: processedData.length,
        total_gaji: totalGaji,
        has_action: hasAction,
        data: processedData,
      });
    }

    // Pagination mode
    const pageNum = Math.max(1, Number(page));
    const lim = Math.max(1, Math.min(100, Number(limit))); // Cap limit at 100

    const result = await baseQuery.page(pageNum - 1, lim);

    // Process data: check if operator has access and sensor gaji
    const processedData = result.results.map((item) => {
      // Check if unor_pk matches unor_id_simaster
      const unorIsMatch =
        item.unor_pk && item.unor_id_simaster
          ? item.unor_pk === item.unor_id_simaster
          : null;

      // Admin can see all gaji but has_action is false
      if (current_role === "admin") {
        return {
          ...item,
          unor_is_match: unorIsMatch,
          // Gaji tetap ditampilkan untuk admin
        };
      }

      // For non-admin: check operator access
      const unorFieldToCheck =
        unor_type === "pk" ? item.unor_pk : item.unor_id_simaster;

      const hasAccess =
        currentOperator &&
        unorId &&
        unorFieldToCheck &&
        String(unorFieldToCheck).startsWith(String(unorId));

      return {
        ...item,
        unor_is_match: unorIsMatch,
        gaji: hasAccess ? item.gaji : "***", // Sensor gaji jika tidak ada akses
      };
    });

    // Calculate total gaji using SQL
    const knex = P3KParuhWaktu.knex();
    let totalGaji = 0;

    if (current_role === "admin") {
      // Admin: SUM semua gaji
      const totalResult = await knex("pengadaan.p3k_paruh_waktu")
        .where("unor_id_simaster", "ILIKE", `${opdIdFilter}%`)
        .where((builder) => {
          if (nama) {
            builder.where("nama", "ILIKE", `%${nama}%`);
          }
          if (nip) {
            builder.where("nip", "ILIKE", `%${nip}%`);
          }
          if (no_peserta) {
            builder.where("no_peserta", "ILIKE", `%${no_peserta}%`);
          }
        })
        .sum("gaji as total")
        .first();

      totalGaji = Number(totalResult?.total || 0);
    } else if (currentOperator && unorId) {
      // Non-admin: SUM gaji yang memiliki akses
      const unorField = unor_type === "pk" ? "unor_pk" : "unor_id_simaster";
      const totalResult = await knex("pengadaan.p3k_paruh_waktu")
        .where("unor_id_simaster", "ILIKE", `${opdIdFilter}%`)
        .where(unorField, "ILIKE", `${unorId}%`)
        .where((builder) => {
          if (nama) {
            builder.where("nama", "ILIKE", `%${nama}%`);
          }
          if (nip) {
            builder.where("nip", "ILIKE", `%${nip}%`);
          }
          if (no_peserta) {
            builder.where("no_peserta", "ILIKE", `%${no_peserta}%`);
          }
        })
        .sum("gaji as total")
        .first();

      totalGaji = Number(totalResult?.total || 0);
    }

    // Check if operator has action (can access any data in current page)
    // Admin always has has_action: false
    let hasAction = false;
    if (current_role !== "admin") {
      hasAction =
        currentOperator &&
        unorId &&
        processedData.some((item) => {
          const unorFieldToCheck =
            unor_type === "pk" ? item.unor_pk : item.unor_id_simaster;
          return (
            unorFieldToCheck &&
            String(unorFieldToCheck).startsWith(String(unorId))
          );
        });
    }

    const data = {
      success: true,
      page: pageNum,
      limit: lim,
      total: result.total,
      total_gaji: totalGaji,
      has_action: hasAction || false,
      data: processedData,
    };

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Sync/Upsert data pengadaan paruh waktu ke tabel p3k_paruh_waktu
 * Strategi: UPSERT (INSERT ... ON CONFLICT DO UPDATE)
 * - Insert jika record belum ada (gaji default 0)
 * - Update jika sudah ada (kecuali gaji, biar tetap sesuai yang sudah di-set)
 * Kolom: id (unique), usulan_id, nama, no_peserta, nip, unor_id_siasn, unor_id_simaster, gaji
 */
export const syncPengadaanParuhWaktu = async (req, res) => {
  const knex = P3KParuhWaktu.knex();

  try {
    // Query ringan - hanya ambil kolom yang diperlukan
    const dataToSync = await knex("siasn_pengadaan_proxy as sp")
      .where("sp.periode", "2025")
      .andWhere("sp.jenis_formasi_id", "0210") // Filter untuk PPPK Paruh Waktu
      .leftJoin(
        knex.raw(`(
          SELECT DISTINCT ON (id_siasn) id_siasn, id_simaster
          FROM rekon.unor
          ORDER BY id_siasn, id_simaster
        ) as ru`),
        knex.raw("sp.usulan_data->'data'->>'unor_id'"),
        "ru.id_siasn"
      )
      .select(
        "sp.id",
        "sp.nama",
        knex.raw("sp.usulan_data->'data'->>'no_peserta' as no_peserta"),
        knex.raw(
          "get_hierarchy_siasn(sp.usulan_data->'data'->>'unor_id') as unor_siasn_text"
        ),
        knex.raw(
          "CASE WHEN ru.id_simaster IS NOT NULL THEN get_hierarchy_simaster(ru.id_simaster) ELSE NULL END as unor_simaster_text"
        ),
        "sp.nip",
        "ru.id_siasn as unor_id_siasn",
        "ru.id_simaster as unor_id_simaster",
        "sp.status_usulan as usulan_id"
      );

    if (dataToSync.length === 0) {
      return res.json({
        success: true,
        message: "Tidak ada data untuk di-sync",
        data: {
          total: 0,
          inserted: 0,
          updated: 0,
        },
      });
    }

    // Transform ke format sederhana dengan gaji default 0
    const transformedData = dataToSync.map((row) => ({
      id: row?.id,
      unor_siasn_text: row?.unor_siasn_text,
      unor_simaster_text: row?.unor_simaster_text,
      usulan_id: row?.usulan_id,
      nama: row?.nama,
      no_peserta: row?.no_peserta,
      nip: row.nip,
      unor_id_siasn: row.unor_id_siasn,
      unor_id_simaster: row.unor_id_simaster,
      gaji: 0, // Default 0 untuk record baru
    }));

    // UPSERT: Insert jika baru, Update jika sudah ada (kecuali gaji)
    const result = await knex.raw(
      `
      INSERT INTO pengadaan.p3k_paruh_waktu (id, unor_siasn_text, unor_simaster_text, usulan_id, nama, no_peserta, nip, unor_id_siasn, unor_id_simaster, gaji)
      SELECT * FROM json_populate_recordset(NULL::record, ?::json) 
        AS t(id text, unor_siasn_text text, unor_simaster_text text, usulan_id text, nama text, no_peserta text, nip text, unor_id_siasn text, unor_id_simaster text, gaji bigint)
      ON CONFLICT (id) 
      DO UPDATE SET 
        unor_siasn_text = EXCLUDED.unor_siasn_text,
        unor_simaster_text = EXCLUDED.unor_simaster_text,
        usulan_id = EXCLUDED.usulan_id,
        nama = EXCLUDED.nama,
        no_peserta = EXCLUDED.no_peserta,
        nip = EXCLUDED.nip,
        unor_id_siasn = EXCLUDED.unor_id_siasn,
        unor_id_simaster = EXCLUDED.unor_id_simaster,
        updated_at = NOW()
        -- gaji tidak di-update, tetap menggunakan nilai yang sudah ada
    `,
      [JSON.stringify(transformedData)]
    );

    res.json({
      success: true,
      message: `Berhasil sync data pengadaan paruh waktu (UPSERT)`,
      data: {
        total: dataToSync.length,
        processed: result.rowCount || transformedData.length,
      },
    });
  } catch (error) {
    log.error("Error sync pengadaan paruh waktu:", error);
    res.status(500).json({
      success: false,
      message: "Error sync pengadaan paruh waktu",
      error: error?.message,
    });
  }
};

// crud untuk operator gaji pw
export const createOperatorGajiPW = async (req, res) => {
  try {
    const { unor_id, user_id } = req?.body;
    const result = await OperatorGajiPW.query()
      .insert({ unor_id, user_id })
      .onConflict("unor_id", "user_id")
      .ignore();
    return result;
  } catch (error) {
    throw error;
  }
};

export const getAuditLogPengadaanParuhWaktu = async (req, res) => {
  try {
    const { current_role, customId, organization_id } = req?.user;
    const {
      page = 1,
      limit = 10,
      nama_operator = "",
      nama_pegawai = "",
      organization_id: filter_organization_id = "",
    } = req?.query;

    const isAdmin = current_role === "admin";

    let query = AuditLog.query()
      .leftJoin("users", "users.custom_id", "pengadaan.audit_log.change_by")
      .leftJoin(
        "pengadaan.p3k_paruh_waktu",
        "pengadaan.p3k_paruh_waktu.id",
        "pengadaan.audit_log.record_id"
      );

    if (!isAdmin) {
      query = query.where("pengadaan.audit_log.change_by", customId);
    }

    // Filter berdasarkan organization_id
    if (filter_organization_id) {
      query = query.where("users.organization_id", filter_organization_id);
    } else if (!isAdmin && organization_id) {
      // Jika bukan admin dan tidak ada filter, gunakan organization_id user yang login
      query = query.where("users.organization_id", organization_id);
    }

    // Pencarian nama operator (users.username)
    if (nama_operator) {
      query = query.where("users.username", "ILIKE", `%${nama_operator}%`);
    }

    // Pencarian nama pegawai (detail.nama)
    if (nama_pegawai) {
      query = query.where(
        "pengadaan.p3k_paruh_waktu.nama",
        "ILIKE",
        `%${nama_pegawai}%`
      );
    }

    // Select kolom dari audit_log untuk menghindari duplikasi
    query = query.select("pengadaan.audit_log.*");

    // Check if limit = -1 for downloading all data
    if (Number(limit) === -1) {
      const result = await query.withGraphFetched(
        "[user(simpleWithImage), detail]"
      );
      return res.json({
        success: true,
        total: result.length,
        data: result,
      });
    }

    // Pagination mode
    const pageNum = Math.max(1, Number(page));
    const lim = Math.max(1, Math.min(100, Number(limit))); // Cap limit at 100

    const result = await query
      .page(pageNum - 1, lim)
      .withGraphFetched("[user(simpleWithImage), detail]")
      .orderBy("change_at", "desc");

    const data = {
      success: true,
      page: pageNum,
      limit: lim,
      total: result.total,
      data: result.results,
    };

    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

// update
export const updateGajiPengadaanParuhWaktu = async (req, res) => {
  try {
    const knex = P3KParuhWaktu.knex();

    const { id } = req?.query;
    const { gaji, unor_pk, luar_perangkat_daerah, is_blud, one_time_code } =
      req?.body;
    const { customId } = req?.user;

    // Validasi: one_time_code wajib ada
    if (!one_time_code) {
      return res.status(400).json({
        success: false,
        message: "Kode OTP wajib diisi",
      });
    }

    // Verifikasi OTP menggunakan operatorVerifyMfa
    const isOtpValid = await operatorVerifyMfa(req.fetcher, one_time_code);

    if (!isOtpValid) {
      return res.status(401).json({
        success: false,
        message: "Kode OTP tidak valid atau sudah kadaluarsa",
      });
    }

    const currentOperator = await OperatorGajiPW.query()
      .where("user_id", customId)
      .first();

    // Validasi: Harus merupakan operator
    if (!currentOperator) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Anda bukan operator",
      });
    }

    const unorId = currentOperator?.unor_id;

    // Validasi: Operator tidak boleh terkunci
    if (currentOperator?.is_locked) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Operator terkunci",
      });
    }

    const ipAddress =
      req?.headers["x-forwarded-for"] || req?.socket?.remoteAddress;

    // Fetch current data before update
    const currentData = await P3KParuhWaktu.query().where("id", id).first();

    if (!currentData) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }

    // Validasi: unorId harus children dari unor_id pegawai
    if (unorId) {
      const hasAccess =
        currentData.unor_id_simaster &&
        String(currentData.unor_id_simaster).startsWith(String(unorId));

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden: Anda tidak memiliki akses untuk mengupdate data ini",
        });
      }
    }

    // get text unor text pk from database
    const textPk = await knex.raw(
      `select get_hierarchy_simaster('${unor_pk?.toString()}') as text_pk`
    );

    // Prepare update data
    const updateData = {
      gaji,
      unor_pk,
      unor_pk_text: textPk?.rows[0]?.text_pk,
      luar_perangkat_daerah,
      is_blud: is_blud || false,
      updated_at: new Date(),
      last_updated_by: customId,
    };

    // Update the record
    const result = await P3KParuhWaktu.query()
      .where("id", id)
      .patch(updateData)
      .returning("*");

    // Prepare audit log values
    const auditFields = [
      "gaji",
      "unor_pk",
      "unor_pk_text",
      "luar_perangkat_daerah",
      "is_blud",
      "updated_at",
      "last_updated_by",
    ];
    const oldValue = auditFields.reduce((acc, field) => {
      acc[field] = currentData[field];
      return acc;
    }, {});

    const newValue = auditFields.reduce((acc, field) => {
      acc[field] = updateData[field];
      return acc;
    }, {});

    // Create audit log entry
    await AuditLog.query().insert({
      table_name: "pengadaan.p3k_paruh_waktu",
      record_id: id,
      action: "update",
      old_data: JSON.stringify(oldValue),
      new_data: JSON.stringify(newValue),
      change_by: customId,
      change_at: new Date(),
      ip_address: ipAddress,
    });

    return res.json({
      success: true,
      message: "Berhasil update gaji pengadaan paruh waktu",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error update gaji pengadaan paruh waktu",
      error: error?.message,
    });
  }
};

export const getAuditLogById = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await AuditLog.query()
      .where("record_id", id)
      .orderBy("change_at", "desc");
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const addOperatorGajiPW = async (req, res) => {
  try {
    const { unor_id, user_id } = req?.body;

    // Check if already exists
    const existing = await OperatorGajiPW.query()
      .where({ unor_id, user_id })
      .first();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Operator sudah terdaftar untuk unit organisasi ini",
      });
    }

    const result = await OperatorGajiPW.query()
      .insert({ unor_id, user_id })
      .returning("*");
    const resultWithUser = await OperatorGajiPW.query()
      .where("id", result.id)
      .withGraphFetched("user(simpleWithImage)")
      .first();
    res.json(resultWithUser || result);
  } catch (error) {
    handleError(res, error);
  }
};

export const getOperatorGajiPW = async (req, res) => {
  try {
    const knex = OperatorGajiPW.knex();
    const { unor_id } = req?.query;

    let query = OperatorGajiPW.query()
      .withGraphFetched("[user(simpleWithImage), pengunci(simpleWithImage)]")
      .select(
        "*",
        knex.raw("get_hierarchy_simaster(unor_id) as unit_organisasi")
      )
      .orderBy("created_at", "asc");

    if (unor_id) {
      query = query.where("unor_id", unor_id);
    }

    const result = await query;
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteOperatorGajiPW = async (req, res) => {
  try {
    const { id } = req?.query;
    const result = await OperatorGajiPW.query().where("id", id).delete();
    res.json({ success: true, deleted: result });
  } catch (error) {
    handleError(res, error);
  }
};

export const toggleLockOperatorGajiPW = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { id } = req?.query;
    const { is_locked } = req?.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID operator tidak ditemukan",
      });
    }

    // Jika is_locked tidak dikirim, ambil dari database dulu untuk toggle
    let newLockStatus;
    if (is_locked !== undefined) {
      newLockStatus = is_locked;
    } else {
      const operator = await OperatorGajiPW.query().where("id", id).first();
      if (!operator) {
        return res.status(404).json({
          success: false,
          message: "Operator tidak ditemukan",
        });
      }
      newLockStatus = !operator.is_locked;
    }

    const result = await OperatorGajiPW.query().where("id", id).update({
      is_locked: newLockStatus,
      locked_at: new Date(),
      locked_by: customId,
    });
    res.json({ success: true, locked: result });
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
};

export const lockAllOperatorGajiPW = async (req, res) => {
  try {
    const { customId } = req?.user;
    const { is_locked = true } = req?.body;
    const result = await OperatorGajiPW.query().update({
      is_locked: is_locked,
      locked_at: new Date(),
      locked_by: customId.toString(),
    });
    res.json({ success: true, locked: result });
  } catch (error) {
    console.log(error);
    handleError(res, error);
  }
};

export const getStatsPengadaanParuhWaktu = async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    handleError(res, error);
  }
};
