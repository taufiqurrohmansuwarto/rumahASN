import { rwKedudukanHukumByNip } from "@/services/master.services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, Tooltip } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import ComparePemberhentianByNip from "./ComparePemberhentianByNip";

function CompareKedudukanHukumByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["kedudukan-hukum", nip],
    () => rwKedudukanHukumByNip(nip),
    {
      enabled: !!nip,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const columns = [
    {
      title: "File",
      dataIndex: "file_sk",
      render: (_, record) => {
        return (
          <div>
            <a
              href={record?.file_kedudukan_hukum}
              target="_blank"
              rel="noreferrer"
            >
              <Tooltip title="File SK">
                <FilePdfOutlined />
              </Tooltip>
            </a>
          </div>
        );
      },
    },
    {
      title: "Kedudukan Hukum",
      key: "kedudukan_hukum",
      render: (_, row) => <>{row?.kedudukan_hukum?.kedudukan_hukum}</>,
    },
    {
      title: "Tgl. SK",
      dataIndex: "tgl_sk",
    },
    {
      title: "No. SK",
      dataIndex: "no_sk",
    },
    {
      title: "Keterangan Instansi",
      dataIndex: "keterangan_instansi",
    },
    {
      title: "Tgl. Edit",
      dataIndex: "tgl_edit",
    },
    {
      title: "Jam Edit",
      dataIndex: "jam_edit",
    },
    {
      title: "Aktif",
      dataIndex: "aktif",
    },
  ];

  return (
    <Stack>
      <Card title="Kedudukan Hukum SIMASTER">
        <Table
          columns={columns}
          rowKey={(row) => row?.kedudukan_hukum_id}
          pagination={false}
          dataSource={data}
          loading={isLoading}
        />
      </Card>
      <ComparePemberhentianByNip nip={nip} />
    </Stack>
  );
}

export default CompareKedudukanHukumByNip;
