import {
  getRwKinerjaPeriodikByNip,
  removeKinerjaPeriodikByNip,
} from "@/services/siasn-services";
import { DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Divider,
  Flex,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  message,
} from "antd";
import CreateKinerjaPeriodik from "./CreateKinerjaPeriodik";

const CompareKinerjaPeriodikNip = ({ nip }) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["kinerja-periodik", nip],
    () => getRwKinerjaPeriodikByNip(nip),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { mutateAsync: hapus, isLoading: isLoadingHapus } = useMutation(
    (data) => removeKinerjaPeriodikByNip(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus data kinerja periodik");
      },
      onError: (error) => {
        message.error("Gagal menghapus data kinerja periodik");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["kinerja-periodik", nip]);
      },
    }
  );

  const handleHapus = async (row) => {
    const payload = {
      id: row.id,
      nip: row.nip,
    };

    await hapus(payload);
  };

  const columns = [
    { title: "Tahun", dataIndex: "tahun" },
    { title: "Bulan Mulai", dataIndex: "bulanMulaiPenilaian" },
    { title: "Bulan Selesai", dataIndex: "bulanSelesaiPenilaian" },
    { title: "Kuadran Kinerja", dataIndex: "kuadranKinerjaNilai" },
    { title: "Presentase", dataIndex: "persentase" },
    { title: "Jabatan", dataIndex: "jabatan" },
    { title: "Koefisien", dataIndex: "koefisen" },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => (
        <Space direction="horizontal">
          <Popconfirm
            title="Are you sure you want to delete this item?"
            onConfirm={() => handleHapus(row)}
          >
            <Tooltip title="Hapus">
              <a>
                <DeleteOutlined />
              </a>
            </Tooltip>
          </Popconfirm>
          <Divider type="vertical" />
        </Space>
      ),
    },
  ];

  return (
    <Card title="Kinerja Periodik" id="kinerja-periodik">
      <div style={{ marginBottom: 10 }}>
        <CreateKinerjaPeriodik />
      </div>
      <Flex vertical gap={10}>
        <Table
          pagination={false}
          columns={columns}
          dataSource={data}
          loading={isLoading}
        />
      </Flex>
    </Card>
  );
};

export default CompareKinerjaPeriodikNip;
