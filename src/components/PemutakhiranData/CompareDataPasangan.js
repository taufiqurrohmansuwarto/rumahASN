import { dataPasangan } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import FormKeluarga from "./FormKeluarga";
import { Table, Typography, Tag, Empty, Card, Divider } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

/**
 * Komponen untuk menampilkan data pasangan dari SIASN
 *
 * Format data pasangan dari API:
 * {
 *   "nipBaru": "199103052019031008",
 *   "nipLama": null,
 *   "idPns": "7E85A2743B04BD8DE050640A3C036B36",
 *   "listPasangan": [
 *     {
 *       "orang": {
 *         "id": "1eec9bef-ae07-487e-a864-9b5410234238",
 *         "created_at": "2023-12-10T12:59:14.543143Z",
 *         "ayahId": "",
 *         "ibuId": "",
 *         "nama": "LISTYA WIDIANINGRUM",
 *         "namaKtp": "",
 *         "gelarDepan": "",
 *         "gelarBlk": "",
 *         "tempatLahir": "",
 *         "tglLahir": "17-01-1992",
 *         "aktaMeninggal": "",
 *         "tglMeninggal": "01-01-0001",
 *         "jenisKelamin": "F",
 *         "jenisAnak": null,
 *         "StatusHidup": "1",
 *         "JenisKawinId": "1",
 *         "karisKarsu": "undefined"
 *       },
 *       "statusNikah": "Menikah",
 *       "dataPernikahan": {
 *         "id": "cd9e0e97-f3b3-479d-b68e-86f5a25aae27",
 *         "orangId": "1eec9bef-ae07-487e-a864-9b5410234238",
 *         "pnsOrangId": "7E85A2743B04BD8DE050640A3C036B36",
 *         "tgglMenikah": "24-03-2022",
 *         "aktaMenikah": "0066282022",
 *         "tgglCerai": "01-01-0001",
 *         "aktaCerai": "",
 *         "posisi": 1,
 *         "status": "1",
 *         "isPns": false,
 *         "noSkPensiun": ""
 *       }
 *     }
 *   ]
 * }
 */

// Komponen utama
const DataPasanganView = () => {
  const { data: pasanganData, isLoading } = useQuery(
    ["pasangan-siasn"],
    () => dataPasangan(),
    {}
  );

  // Format tanggal dari "DD-MM-YYYY" menjadi "DD MMMM YYYY"
  const formatDate = (dateString) => {
    if (!dateString || dateString === "01-01-0001") return "-";
    return dayjs(dateString, "DD-MM-YYYY").format("DD MMMM YYYY");
  };

  // Definisi kolom tabel
  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
      render: (text, record) => (
        <div>
          <Text strong>{text || "-"}</Text>
          {record.isPns && (
            <Tag color="warning" style={{ marginLeft: 8 }}>
              PNS
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "statusNikah",
      key: "statusNikah",
      render: (text) => (
        <Tag color={text === "Menikah" ? "success" : "error"}>
          {text || "-"}
        </Tag>
      ),
    },
    {
      title: "Jenis Kelamin",
      dataIndex: "jenisKelamin",
      key: "jenisKelamin",
      render: (text) =>
        text === "F" ? "Perempuan" : text === "M" ? "Laki-laki" : "-",
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tglLahir",
      key: "tglLahir",
      render: (text) => formatDate(text),
    },
    {
      title: "Tanggal Menikah",
      dataIndex: "tgglMenikah",
      key: "tgglMenikah",
      render: (text) => formatDate(text),
    },
    {
      title: "Akta Nikah",
      dataIndex: "aktaMenikah",
      key: "aktaMenikah",
      render: (text) => text || "-",
    },
  ];

  // Transformasi data untuk tabel
  const tableData =
    pasanganData?.listPasangan?.map((item, index) => ({
      key: index,
      nama: item.orang?.nama,
      statusNikah: item.statusNikah,
      jenisKelamin: item.orang?.jenisKelamin,
      tglLahir: item.orang?.tglLahir,
      tgglMenikah: item.dataPernikahan?.tgglMenikah,
      aktaMenikah: item.dataPernikahan?.aktaMenikah,
      isPns: item.dataPernikahan?.isPns,
    })) || [];

  // Locale untuk tabel kosong
  const locale = {
    emptyText: (
      <Empty
        description="Data pasangan tidak tersedia atau belum terdata dalam sistem"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    ),
  };

  return (
    <>
      <Card title="Data Pasangan">
        <Table
          columns={columns}
          dataSource={tableData}
          loading={isLoading}
          pagination={false}
          size="middle"
          locale={locale}
        />
      </Card>
      {JSON.stringify(pasanganData)}
      <Divider />

      <Card title="Form Keluarga">
        <FormKeluarga />
      </Card>
    </>
  );
};

export default DataPasanganView;
