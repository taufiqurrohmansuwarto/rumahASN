import { getHukdisByNip } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";

const CompareHukdisByNip = ({ nip }) => {
  const { data, isLoading } = useQuery(
    ["hukdis", nip],
    () => getHukdisByNip(nip),
    {}
  );

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <>
            {row?.path?.[882] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[882]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Nomor SK",
      dataIndex: "skNomor",
    },
    {
      title: "Tgl. SK",
      dataIndex: "skTanggal",
    },
    {
      title: "Tgl. Hukuman",
      dataIndex: "hukumanTanggal",
    },
    {
      title: "Masa Tahun",
      dataIndex: "masaTahun",
    },
    {
      title: "Alasan Hukuman Disiplin",
      dataIndex: "alasanHukumanDisiplinNama",
    },
    {
      title: "Jenis Hukuman Disiplin",
      dataIndex: "jenisHukumanNama",
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
    },
  ];

  return (
    <>
      <Table
        title={() => "Hukuman Disiplin SIASN"}
        columns={columns}
        isLoading={isLoading}
        dataSource={data}
        rowKey={(row) => row?.id}
        pagination={false}
      />
    </>
  );
};

export default CompareHukdisByNip;
