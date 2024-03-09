import {
  downloadParticipants,
  getParticipants,
} from "@/services/webinar.services";
import {
  formatDateSimple,
  participantColor,
  participantEmployeeNumber,
  participantUsername,
} from "@/utils/client-utils";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
  Input,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import Bar from "@/components/Plots/Bar";
import Pie from "../Plots/Pie";

const AggregasiJabatan = ({ data }) => {
  const config = {
    data,
    xField: "value",
    yField: "title",
    seriesField: "title",
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
    seriesField: "title",
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

const AggregasiDownloadSertifikat = ({ data }) => {
  const config = {
    data,
    angleField: "value",
    colorField: "type",
    radius: 1,
    innerRadius: 0.64,
    meta: {
      value: {
        formatter: (v) => `${v} orang`,
      },
    },
  };

  return (
    <Card title="Aggregasi Unduh Sertifikat">
      <Pie {...config} />
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
      limit: 10,
    },
  });

  const handleSearch = (value) => {
    if (!value) {
      value = undefined;
    }

    setQuery({
      ...query,
      query: {
        ...query?.query,
        search: value,
        page: 1,
      },
    });
  };

  const {
    data: participants,
    isLoading: isLoadingParticipants,
    isFetching,
  } = useQuery(
    ["webinar-series-admin-detail-participants", query],
    () => getParticipants(query),
    {
      keepPreviousData: true,
    }
  );

  const columns = [
    {
      title: "Peserta",
      key: "peserta",
      render: (text) => (
        <Stack>
          <Space>
            <Avatar
              shape="square"
              size="default"
              src={text?.participant?.image}
            />
            <Space size="small" direction="vertical">
              <span
                style={{
                  fontSize: 12,
                }}
              >
                {participantUsername(text?.participant)}
              </span>
              <Tag color={participantColor(text?.participant?.group)}>
                {text?.participant?.group}
              </Tag>
            </Space>
          </Space>

          <Space></Space>
          <div>{formatDateSimple(text?.created_at)} </div>
        </Stack>
      ),
      responsive: ["xs"],
    },
    {
      responsive: ["sm"],
      title: "Nama",
      key: "name",
      render: (text) => (
        <Stack>
          <Space>
            <Avatar size="small" src={text?.participant?.image} />
            <span>{participantUsername(text?.participant)}</span>
          </Space>
        </Stack>
      ),
    },
    {
      responsive: ["sm"],
      title: "Group",
      key: "group",
      render: (text) => {
        return (
          <Tag color={participantColor(text?.participant?.group)}>
            {text?.participant?.group}
          </Tag>
        );
      },
    },
    {
      responsive: ["sm"],
      title: "Nomer Pegawai",
      key: "employee_number",
      render: (text) => (
        <span>{participantEmployeeNumber(text?.participant)}</span>
      ),
    },
    {
      responsive: ["sm"],
      title: "Jabatan",
      key: "jabatan",
      render: (text) => (
        <span>{text?.participant?.info?.jabatan?.jabatan}</span>
      ),
    },
    {
      responsive: ["sm"],
      title: "Perangkat Daerah",
      key: "perangkat_daerah",
      render: (text) => (
        <span>{text?.participant?.info?.perangkat_daerah?.detail}</span>
      ),
    },
    {
      responsive: ["sm"],
      title: "Tgl. Pendaftaran",
      key: "created_at",
      render: (text) => <span>{formatDateSimple(text?.created_at)}</span>,
    },
    {
      responsive: ["sm"],
      title: "Sudah Generate Sertifikat",
      key: "is_generate_certificate",
      render: (text) => {
        return (
          <Tag color={text?.is_generate_certificate ? "green" : "red"}>
            {text?.is_generate_certificate ? "Sudah" : "Belum"}
          </Tag>
        );
      },
    },
  ];

  return (
    <>
      <Card title="Daftar Peserta">
        <Table
          columns={columns}
          title={() => (
            <Space direction="vertical">
              <Tooltip title="Unduh Data Peserta">
                <Button
                  disabled={isLoadingWebinarParticipants}
                  loading={isLoadingWebinarParticipants}
                  onClick={handleDownload}
                  type="primary"
                  icon={<CloudDownloadOutlined />}
                >
                  Peserta
                </Button>
              </Tooltip>
              <Input.Search
                allowClear
                onSearch={handleSearch}
                enterButton
                style={{
                  width: 800,
                }}
              />
            </Space>
          )}
          size="small"
          pagination={{
            position: ["bottomRight", "topRight"],
            size: "small",
            current: query?.query?.page,
            total: participants?.result?.total,
            showSizeChanger: false,
            showTotal: (total) => `Total ${total} peserta`,
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
          loading={isLoadingParticipants || isFetching}
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
          <AggregasiDownloadSertifikat
            data={participants?.aggregate?.certificate}
          />
        </Stack>
      )}
    </>
  );
}

export default DetailWebinarParticipants;
