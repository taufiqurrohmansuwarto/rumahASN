import {
  downloadParticipants,
  getParticipants,
} from "@/services/webinar.services";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, Button, Card, Space, Table, Tag, message } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import { Bar } from "@ant-design/plots";
import { Stack } from "@mantine/core";
import { formatDateLL, formatDateSimple } from "@/utils/client-utils";

const AggregasiJabatan = ({ data }) => {
  const config = {
    data,
    xField: "value",
    yField: "title",
    seriesField: "jabatan",
    label: {
      position: "middle",
    },
    legend: { position: "top-left" },
  };

  return (
    <Card title="Agregasi Jabatan">
      <Bar {...config} />
    </Card>
  );
};

const AggregasiPerangkatDaerah = ({ data }) => {
  const config = {
    data,
    xField: "value",
    yField: "title",
    seriesField: "daerah",
    label: {
      position: "middle",
    },
    legend: { position: "top-left" },
  };

  return (
    <Card title="Agregasi Perangkat Daerah">
      <Bar {...config} />
    </Card>
  );
};

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
        <Stack>
          <Space>
            <Avatar size="small" src={text?.participant?.image} />
            <span>{text?.participant?.username}</span>
          </Space>
        </Stack>
      ),
    },
    {
      title: "Group",
      key: "group",
      render: (text) => {
        return <Tag color="green">{text?.participant?.group}</Tag>;
      },
    },
    {
      title: "Nomer Pegawai",
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
    {
      title: "Tgl. Pendaftaran",
      key: "created_at",
      render: (text) => <span>{formatDateSimple(text?.created_at)}</span>,
    },
  ];

  return (
    <>
      <Card title="Daftar Peserta">
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
          dataSource={participants?.result?.data}
        />
      </Card>

      {participants?.aggregate && (
        <Stack mt={10}>
          <AggregasiJabatan data={participants?.aggregate?.jabatan} />
          <AggregasiPerangkatDaerah
            data={participants?.aggregate?.perangkat_daerah}
          />
        </Stack>
      )}
    </>
  );
}

export default DetailWebinarParticipants;
