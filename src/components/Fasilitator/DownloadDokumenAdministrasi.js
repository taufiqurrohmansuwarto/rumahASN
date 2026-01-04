import { downloadDokumenAdministrasi } from "@/services/master.services";
import { DOKUMEN_ADMINISTRASI, LIST_TMT } from "@/utils/client-utils";
import { IconDownload, IconFileZip } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { Button, Dropdown, Select, Space, message } from "antd";
import { useState } from "react";

// Helper untuk parse error dari arraybuffer
const parseErrorResponse = async (error) => {
  try {
    if (error?.response?.data instanceof ArrayBuffer) {
      const text = new TextDecoder().decode(error.response.data);
      const json = JSON.parse(text);
      return json?.message || "Gagal mengunduh dokumen";
    }
    return error?.response?.data?.message || "Gagal mengunduh dokumen";
  } catch {
    return "Gagal mengunduh dokumen";
  }
};

function DownloadDokumenAdministrasi() {
  const [tmt, setTmt] = useState(null);
  const [fileType, setFileType] = useState(null);

  const mutation = useMutation(
    async (params) => {
      const response = await downloadDokumenAdministrasi(params);

      // Cek jika response adalah error JSON (bukan ZIP)
      const contentType = response.headers?.["content-type"] || "";
      if (contentType.includes("application/json")) {
        const text = new TextDecoder().decode(response.data);
        const json = JSON.parse(text);
        throw new Error(json?.message || "Gagal mengunduh");
      }

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/zip" })
      );
      const link = document.createElement("a");
      link.href = url;
      const filename = `dokumen_${params.file}_${params.tmt}.zip`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    {
      onError: async (error) => {
        const errorMsg = await parseErrorResponse(error);
        message.error(errorMsg);
      },
    }
  );

  const handleDownload = () => {
    if (!tmt || !fileType) {
      message.warning("Pilih TMT dan Jenis Dokumen terlebih dahulu");
      return;
    }
    mutation.mutate({ tmt, file: fileType });
  };

  const canDownload = tmt && fileType;

  const dropdownContent = (
    <div
      style={{
        padding: 12,
        width: 200,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Select
          placeholder="Pilih TMT *"
          size="small"
          style={{ width: "100%" }}
          value={tmt}
          onChange={setTmt}
          options={LIST_TMT.map((t) => ({ value: t.value, label: t.label }))}
        />
        <Select
          placeholder="Jenis Dokumen *"
          size="small"
          style={{ width: "100%" }}
          value={fileType}
          onChange={setFileType}
          options={DOKUMEN_ADMINISTRASI.map((d) => ({
            value: d.code,
            label: d.name,
          }))}
        />
        <Button
          type="primary"
          size="small"
          block
          icon={<IconFileZip size={14} />}
          loading={mutation.isLoading}
          onClick={handleDownload}
          disabled={!canDownload}
        >
          Unduh ZIP
        </Button>
      </Space>
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button size="small" icon={<IconDownload size={14} />}>
        Dok. Administrasi
      </Button>
    </Dropdown>
  );
}

export default DownloadDokumenAdministrasi;
