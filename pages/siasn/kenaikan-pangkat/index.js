import Layout from "@/components/Layout";
import { getDaftarKenaikanPangkatByPeriode } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { DatePicker, Skeleton, Table } from "antd";
import { useState } from "react";
import moment from "moment";

const DaftarKenaikanPangkat = () => {
  const [date, setDate] = useState(new Date());

  const { data, isLoading } = useQuery(
    ["kenaikan-pangkat", moment(date).format("YYYY-MM-DD")],
    () => getDaftarKenaikanPangkatByPeriode(moment(date).format("YYYY-MM-DD")),
    {
      enabled: !!date,
    }
  );

  const columns = [
    {
      title: "File Pertek",
      key: "file_pertek",
      render: (_, record) => {
        return (
          <>
            {record?.path_ttd_pertek && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path_ttd_pertek}`}
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
      title: "File Preview SK",
      key: "file_preview_sk",
      render: (_, record) => {
        return (
          <>
            {record?.path_preview_sk && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path_preview_sk}`}
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
      title: "Id",
      dataIndex: "id",
    },
    {
      title: "NIP",
      dataIndex: "nipBaru",
    },
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "Tgl Pertek",
      dataIndex: "tgl_pertek",
    },
    {
      title: "Tgl SK",
      dataIndex: "tgl_sk",
    },
    {
      title: "Status Usulan Nama",
      dataIndex: "statusUsulanNama",
    },
  ];

  return (
    <div>
      <h1>Daftar Kenaikan Pangkat</h1>
      <Table
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        pagination={{
          total: data?.count,
        }}
      />
      <DatePicker format="YYYY-MM-DD" onChange={(date) => setDate(date)} />
    </div>
  );
};

DaftarKenaikanPangkat.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DaftarKenaikanPangkat;
