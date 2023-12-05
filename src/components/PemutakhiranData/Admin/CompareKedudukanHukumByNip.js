import { rwKedudukanHukumByNip } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";

function CompareKedudukanHukumByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["kedudukan-hukum", nip],
    () => rwKedudukanHukumByNip(nip),
    { enabled: !!nip }
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
              File
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
      title: "Aktif",
      dataIndex: "aktif",
    },
  ];

  return (
    <>
      <Table
        title={() => <h3>Kedudukan Hukum SIMASTER</h3>}
        columns={columns}
        rowKey={(row) => row?.kedudukan_hukum_id}
        pagination={false}
        dataSource={data}
        loading={isLoading}
      />
    </>
  );
}

export default CompareKedudukanHukumByNip;
