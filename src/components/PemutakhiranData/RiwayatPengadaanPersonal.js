import { dataRiwayatPengadaanPersonal } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Descriptions, Empty, Skeleton, Grid } from "antd";
import dayjs from "dayjs";
import { FilePdfOutlined } from "@ant-design/icons";
import { Space, Tooltip } from "antd";

const DokumenUsulan = ({ dokumen }) => {
  if (!dokumen) return null;

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

const RiwayatPengadaanPersonal = () => {
  const { data, isLoading } = useQuery(
    ["rw-pengadaan-personal"],
    () => dataRiwayatPengadaanPersonal(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const breakpoint = Grid.useBreakpoint();
  const columnCount = breakpoint.xs ? 1 : breakpoint.sm ? 2 : 3;

  return (
    <Skeleton loading={isLoading} active paragraph={{ rows: 10 }}>
      {!data ? (
        <Empty />
      ) : (
        <Descriptions
          size="middle"
          column={columnCount}
          layout="vertical"
          bordered
          style={{
            backgroundColor: "white",
            padding: breakpoint.xs ? "8px" : "16px",
            borderRadius: "8px",
          }}
        >
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
        </Descriptions>
      )}
    </Skeleton>
  );
};

export default RiwayatPengadaanPersonal;
