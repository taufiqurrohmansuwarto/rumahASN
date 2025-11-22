import { dataPangkatByNip } from "@/services/siasn-services";
import { findGolongan, findPangkat } from "@/utils/client-utils";
import {
  Badge as MantineBadge,
  Stack,
  Text as MantineText,
} from "@mantine/core";
import { IconAward, IconFileText, IconRefresh } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Divider, Flex, Space, Table, Typography } from "antd";
import { orderBy } from "lodash";
import { useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import FormUploadKenaikanPangkat from "./FormUploadKenaikanPangkat";
dayjs.locale("id");
dayjs.extend(relativeTime);

const PangkatSiasn = ({
  data,
  isLoading,
  dataSimaster,
  refetch,
  isFetching,
}) => {
  const [open, setOpen] = useState(false);
  const [dataEdit, setDataEdit] = useState(null);

  const handleEdit = (data) => {
    setDataEdit(data);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDataEdit(null);
  };

  const columns = [
    {
      title: "Pangkat & Golongan",
      key: "pangkat",
      width: 200,
      render: (_, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {findPangkat(record?.golonganId)}
          </MantineText>
          <MantineBadge size="sm" color="blue" tt="none">
            {findGolongan(record?.golonganId)}
          </MantineBadge>
        </div>
      ),
    },
    {
      title: "No. SK",
      dataIndex: "skNomor",
      width: 200,
      render: (skNomor, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {skNomor}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.skTanggal}
          </MantineText>
        </div>
      ),
    },
    {
      title: "TMT Golongan",
      key: "tmt_golongan",
      width: 120,
      align: "center",
      render: (_, record) => (
        <MantineBadge size="sm" color="green">
          {dayjs(record?.tmtGolongan).format("DD-MM-YYYY")}
        </MantineBadge>
      ),
    },
    {
      title: "Dokumen",
      key: "file",
      width: 100,
      render: (_, row) => (
        <>
          {row?.path?.[858] && (
            <a
              href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[858]?.dok_uri}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="small" icon={<IconFileText size={14} />}>
                SK
              </Button>
            </a>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <FormUploadKenaikanPangkat
        data={dataEdit}
        dataSimaster={dataSimaster}
        open={open}
        handleClose={handleClose}
      />
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Space>
          <MantineText fw={600} size="sm">
            SIASN
          </MantineText>
          <MantineBadge size="sm" variant="light" color="blue">
            {data?.length || 0}
          </MantineBadge>
        </Space>
        <Button
          size="small"
          onClick={() => refetch()}
          icon={<IconRefresh size={16} />}
          loading={isFetching}
        >
          Refresh
        </Button>
      </Flex>
      <Table
        loading={isLoading || isFetching}
        columns={columns}
        title={null}
        pagination={false}
        size="middle"
        scroll={{ x: 600 }}
        dataSource={orderBy(
          data,
          [
            (o) => {
              return dayjs(o.tmtGolongan).valueOf();
            },
          ],
          ["desc"]
        )}
        rowKey={(row) => row?.id}
        rowClassName={(record, index) =>
          index % 2 === 0 ? "table-row-light" : "table-row-dark"
        }
      />
    </>
  );
};

const PangkatSimaster = ({ data, isLoading }) => {
  const columns = [
    {
      title: "Pangkat & Golongan",
      key: "pangkat",
      width: 200,
      render: (_, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {record?.pangkat?.pangkat}
          </MantineText>
          <MantineBadge size="sm" color="blue" tt="none">
            {record?.pangkat?.gol_ruang}
          </MantineBadge>
        </div>
      ),
    },
    {
      title: "No. SK",
      dataIndex: "no_sk",
      width: 200,
      render: (no_sk, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {no_sk}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.tgl_sk}
          </MantineText>
        </div>
      ),
    },
    {
      title: "TMT Pangkat",
      dataIndex: "tmt_pangkat",
      width: 120,
      align: "center",
      render: (tmt_pangkat) => (
        <MantineBadge size="sm" color="green">
          {tmt_pangkat}
        </MantineBadge>
      ),
    },
    {
      title: "Dokumen",
      key: "file",
      width: 100,
      render: (_, record) => (
        <>
          {record?.file_pangkat && (
            <a href={record.file_pangkat} target="_blank" rel="noreferrer">
              <Button size="small" icon={<IconFileText size={14} />}>
                SK
              </Button>
            </a>
          )}
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "aktif",
      width: 80,
      align: "center",
      render: (aktif) => (
        <MantineBadge
          size="sm"
          color={aktif === "Y" ? "green" : "gray"}
          tt="none"
        >
          {aktif === "Y" ? "Aktif" : "Tidak"}
        </MantineBadge>
      ),
    },
  ];
  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <MantineText fw={600} size="sm">
          SIMASTER
        </MantineText>
        <MantineBadge size="sm" variant="light" color="orange">
          {data?.length || 0}
        </MantineBadge>
      </Space>
      <Table
        loading={isLoading}
        title={null}
        pagination={false}
        columns={columns}
        dataSource={data}
        rowKey={(row) => row?.id}
        size="middle"
        scroll={{ x: 600 }}
        rowClassName={(record, index) =>
          index % 2 === 0 ? "table-row-light" : "table-row-dark"
        }
      />
    </>
  );
};

function ComparePangkatByNip({ nip }) {
  const { data, isLoading, refetch, isFetching } = useQuery(
    ["data-riwayat-pangkat", nip],
    () => dataPangkatByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  return (
    <div>
      <Card
        title={
          <Space>
            <IconAward size={20} color="#faad14" />
            <Typography.Title level={4} style={{ margin: 0 }}>
              Komparasi Pangkat
            </Typography.Title>
          </Space>
        }
      >
      <Stack>
        <PangkatSiasn
          isLoading={isLoading}
            isFetching={isFetching}
            refetch={refetch}
          data={data?.pangkat_siasn}
          dataSimaster={data?.pangkat_simaster}
        />
          <Divider />
          <PangkatSimaster
            isLoading={isLoading}
            data={data?.pangkat_simaster}
          />
      </Stack>
    </Card>
    </div>
  );
}

export default ComparePangkatByNip;
