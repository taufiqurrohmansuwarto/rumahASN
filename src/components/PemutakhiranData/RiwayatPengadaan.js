import { Descriptions, Skeleton, Space, Tooltip } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";

const DokumenUsulan = ({ dokumen, type = "personal" }) => {
  const { data: session } = useSession();

  const isAdmin = session?.user?.current_role === "admin";
  const hasDokumen = Boolean(dokumen);

  if (!hasDokumen || !isAdmin) {
    return null;
  }

  const renderDokumenLink = ([key, value]) => (
    <Tooltip key={key} title={`File ${key}`}>
      <a
        href={`/helpdesk/api/siasn/ws/download?filePath=${value.object}`}
        target="_blank"
        rel="noreferrer"
      >
        <FilePdfOutlined />
      </a>
    </Tooltip>
  );

  return <Space>{Object.entries(dokumen).map(renderDokumenLink)}</Space>;
};

const RiwayatPengadaan = ({ data, loading, type = "personal" }) => {
  return (
    <Skeleton loading={loading} active paragraph={{ rows: 10 }}>
      <Descriptions size="middle" column={3} layout="vertical">
        <Descriptions.Item label="Dokumen Usulan">
          <DokumenUsulan dokumen={data?.dokumen_usulan} />
        </Descriptions.Item>
        <Descriptions.Item label="Nama">
          {data?.usulan_data?.data?.nama}
        </Descriptions.Item>
        <Descriptions.Item label="NIP">{data?.nip}</Descriptions.Item>
        <Descriptions.Item label="Instansi">
          {data?.instansi_nama}
        </Descriptions.Item>
        <Descriptions.Item label="Jenis Layanan">
          {data?.jenis_layanan_nama}
        </Descriptions.Item>
        <Descriptions.Item label="No. SK">{data?.no_sk}</Descriptions.Item>
        <Descriptions.Item label="Tanggal SK">
          {dayjs(data?.tgl_sk).format("DD-MM-YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="No. Pertek">
          {data?.no_pertek}
        </Descriptions.Item>
        <Descriptions.Item label="Tanggal Pertek">
          {dayjs(data?.tgl_pertek).format("DD-MM-YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Status Usulan">
          {data?.status_usulan_nama?.nama}
        </Descriptions.Item>
        <Descriptions.Item label="Jenis Formasi">
          {data?.jenis_formasi_nama}
        </Descriptions.Item>
        <Descriptions.Item label="Jabatan">
          {data?.usulan_data?.data?.jenis_jabatan_nama}
        </Descriptions.Item>
        <Descriptions.Item label="Golongan">
          {data?.usulan_data?.data?.golongan_nama}
        </Descriptions.Item>
        <Descriptions.Item label="TMT CPNS">
          {dayjs(data?.usulan_data?.data?.tmt_cpns).format("DD-MM-YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Tempat Lahir">
          {data?.usulan_data?.data?.tempat_lahir}
        </Descriptions.Item>
        <Descriptions.Item label="Tanggal Lahir">
          {dayjs(data?.usulan_data?.data?.tgl_lahir).format("DD-MM-YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Pendidikan">
          {data?.usulan_data?.data?.pendidikan_pertama_nama}
        </Descriptions.Item>
        <Descriptions.Item label="Unit Organisasi">
          {data?.usulan_data?.data?.unor_nama}
        </Descriptions.Item>
        <Descriptions.Item label="Satuan Kerja">
          {data?.usulan_data?.data?.satuan_kerja_nama}
        </Descriptions.Item>
      </Descriptions>
    </Skeleton>
  );
};

export default RiwayatPengadaan;
