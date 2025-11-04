import axios from "axios";

/**
 * Get background color requirement berdasarkan jabatan & eselon
 */
export const getBackgroundRequirement = (jenisJabatan, eselonId) => {
  if (jenisJabatan === "Jabatan Fungsional") {
    return {
      hex: "#666666",
      label: "abu-abu (Jabatan Fungsional)",
    };
  } else if (jenisJabatan === "Jabatan Struktural") {
    if (eselonId?.startsWith("4")) {
      return {
        hex: "#2e6a10",
        label: "hijau (Struktural Eselon IV)",
      };
    }
    if (eselonId?.startsWith("3")) {
      return {
        hex: "#161efd",
        label: "biru (Struktural Eselon III)",
      };
    }
    if (eselonId?.startsWith("2")) {
      return {
        hex: "#ca3a31",
        label: "merah (Struktural Eselon II)",
      };
    }
  } else if (jenisJabatan === "Jabatan Pelaksana") {
    return {
      hex: "#fc6b17",
      label: "orange (Jabatan Pelaksana)",
    };
  }

  return {
    hex: "#666666",
    label: "abu-abu (default)",
  };
};

/**
 * Convert URL to base64
 */
export const urlToBase64 = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data).toString("base64");
};

/**
 * Format response
 */
export const formatPhotoInsightResponse = (data) => {
  const aiInsight = data.ai_insight;
  const analysisData = data.analysis_data;

  return {
    pegawai: {
      nip: data.nip,
      nama: data.nama,
      jenis_jabatan: data.jenis_jabatan,
      eselon: data.eselon_id,
    },
    analysis: {
      kualitas_foto: {
        blur_score: analysisData.image_quality?.blur_score,
        is_blurry: analysisData.image_quality?.is_blurry,
        quality_level: analysisData.image_quality?.quality_level,
        is_acceptable: analysisData.image_quality?.is_acceptable,
      },
      background: {
        warna_terdeteksi: data.detected_bg_color,
        hex_code: data.detected_bg_hex,
        ketentuan: data.required_bg_label,
        sesuai_standar: data.is_bg_valid,
        sudah_diperbaiki: data.background_fixed,
      },
      seragam: {
        khaki_pns: analysisData.khaki_pns?.is_khaki_pns,
        confidence: analysisData.khaki_pns?.confidence,
        detected: analysisData.clothing?.detected,
        type: analysisData.clothing?.type,
      },
    },
    ai_insight: aiInsight,
    corrected_image_url: data.corrected_image_url,
    timestamp: {
      dibuat: data.created_at,
      diupdate: data.updated_at,
    },
  };
};
