import { rwDiklatByNip } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";

function CompareDataDiklatMasterByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["rw-diklat-master-by-nip", nip],
    () => rwDiklatByNip(nip),
    {}
  );

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <div>
            <a href={row?.file_diklat} target="_blank" rel="noreferrer">
              File
            </a>
          </div>
        );
      },
    },
    {
      title: "Nama",
      dataIndex: "nama_diklat",
    },
    {
      title: "No. Sertifikat",
      dataIndex: "no_sertifikat",
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
    },
    {
      title: "Institusi Penyelenggara",
      dataIndex: "penyelenggara",
    },
    {
      title: "Tanggal Mulai",
      dataIndex: "tanggal_mulai",
    },

    {
      title: "Jenis",
      key: "jenis",
      render: (_, row) => <>{row?.diklat?.name}</>,
    },
    {
      title: "Jumlah Jam",
      dataIndex: "jml",
    },
  ];

  return (
    <div>
      <Table
        pagination={false}
        dataSource={data}
        rowKey={(row) => row?.diklat_id}
        columns={columns}
        loading={isLoading}
      />
    </div>
  );
}

export default CompareDataDiklatMasterByNip;
