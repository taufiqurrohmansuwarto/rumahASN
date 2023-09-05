import {
  downloadParticipants,
  getParticipants,
} from "@/services/webinar.services";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, Button, Space, Table, message } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

function DetailWebinarParticipants() {
  const router = useRouter();
  const { id } = router.query;

  const {
    mutateAsync: webinarParticipants,
    isLoading: isLoadingWebinarParticipants,
  } = useMutation((data) => downloadParticipants(data), {});

  const handleDownload = async () => {
    try {
      const data = await webinarParticipants(id);

      if (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "file.xlsx";
        link.click();

        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.log(error);
      message.error("Gagal mengunduh peserta");
    }
  };

  const [query, setQuery] = useState({
    id,
    query: {
      page: 1,
      limit: 25,
    },
  });

  const { data: participants, isLoading: isLoadingParticipants } = useQuery(
    ["webinar-series-admin-detail-participants", query],
    () => getParticipants(query),
    {
      keepPreviousData: true,
    }
  );

  const columns = [
    ,
    {
      title: "Nama",
      key: "name",
      render: (text) => (
        <Space>
          <Avatar src={text?.participant?.image} />
          <span>{text?.participant?.username}</span>
        </Space>
      ),
    },
    {
      title: "NIP/NIPTTK",
      key: "employee_number",
      render: (text) => <span>{text?.participant?.employee_number}</span>,
    },
    {
      title: "Jabatan",
      key: "jabatan",
      render: (text) => (
        <span>{text?.participant?.info?.jabatan?.jabatan}</span>
      ),
    },
    {
      title: "Perangkat Daerah",
      key: "perangkat_daerah",
      render: (text) => (
        <span>{text?.participant?.info?.perangkat_daerah?.detail}</span>
      ),
    },
  ];

  return (
    <>
      <Table
        size="small"
        columns={columns}
        title={() => (
          <Button
            disabled={isLoadingWebinarParticipants}
            loading={isLoadingWebinarParticipants}
            onClick={handleDownload}
            type="primary"
            icon={<CloudDownloadOutlined />}
          >
            Peserta
          </Button>
        )}
        pagination={{
          pageSize: query?.query?.limit,
          current: query?.query?.page,
          total: participants?.total,
          onChange: (page) => {
            setQuery({
              ...query,
              query: {
                ...query?.query,
                page: page,
              },
            });
          },
        }}
        loading={isLoadingParticipants}
        rowKey={(row) => row?.custom_id}
        dataSource={participants?.data}
      />
    </>
  );
}

export default DetailWebinarParticipants;
