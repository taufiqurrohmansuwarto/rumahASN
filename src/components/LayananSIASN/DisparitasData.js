import { getDisparitas } from "@/services/master.services";
import { ActionIcon, Badge, Indicator, Text, Tooltip } from "@mantine/core";
import { IconAlertTriangle, IconCheck } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Modal, Table, Tag, Typography } from "antd";
import { upperCase } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";

const totalDisparitas = (data) => {
  return data?.filter((item) => item?.result === "Salah").length;
};

const ModalDisparitasData = ({
  open,
  onCancel,
  onOk,
  loading,
  data,
  refetch,
}) => {
  const router = useRouter();

  const handleDetail = (record) => {
    if (record?.jenis === "unor") {
      router.push("/pemutakhiran-data/jabatan");
    } else if (record?.jenis === "skp") {
      router.push("/pemutakhiran-data/laporan-kinerja");
    }
  };

  const columns = [
    {
      title: "Disparitas",
      key: "jenis",
      render: (_, record) => {
        return <Typography.Text>{upperCase(record.jenis)}</Typography.Text>;
      },
    },
    {
      title: "Deskripsi",
      key: "deskripsi",
      dataIndex: "deskripsi",
    },
    {
      title: "SIASN",
      key: "siasn",
      dataIndex: "siasn",
    },
    {
      title: "SIMASTER",
      key: "simaster",
      dataIndex: "simaster",
    },
    {
      title: "Hasil",
      key: "hasil",
      render: (_, record) => {
        return <>{record?.result}</>;
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => {
        return <a onClick={() => handleDetail(record)}>Detail</a>;
      },
    },
  ];

  return (
    <>
      <Modal
        footer={null}
        width={1000}
        open={open}
        onCancel={onCancel}
        onOk={onOk}
        title="Disparitas Data"
      >
        <Button style={{ marginBottom: 16 }} type="primary" onClick={refetch}>
          Refresh
        </Button>
        <Table
          size="small"
          loading={loading}
          rowKey={(row) => row?.jenis}
          pagination={false}
          dataSource={data?.filter((item) => item?.result !== "Benar")}
          columns={columns}
        />
      </Modal>
    </>
  );
};

const disparitasButton = (data) => (
  <ActionIcon
    radius="xs"
    onClick={null}
    variant="light"
    size="xs"
    color={totalDisparitas(data) > 0 ? "red" : "green"}
  >
    {totalDisparitas(data) > 0 ? <IconAlertTriangle /> : <IconCheck />}
  </ActionIcon>
);
function DisparitasData({ data, isLoading, refetch, isFetching }) {
  const handleLihat = (type) => {
    if (type === "SKP") {
      router.push("/pemutakhiran-data/laporan-kinerja");
    }
  };
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <ModalDisparitasData
        open={showModal}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}
        loading={isLoading || isFetching}
        data={data}
        refetch={refetch}
      />
      <Tooltip label="Anda memiliki data yang tidak sesuai dengan SIASN">
        <div>
          {data && (
            <Indicator
              label={totalDisparitas(data)}
              size={16}
              color={totalDisparitas(data) > 0 ? "red" : "green"}
            >
              <Badge
                onClick={handleShowModal}
                sx={{
                  cursor: "pointer",
                }}
                color={totalDisparitas(data) > 0 ? "red" : "green"}
                variant="outline"
                pr={3}
                leftSection={disparitasButton(data)}
              >
                <Text mr="sm">Disparitas Data </Text>
              </Badge>
            </Indicator>
          )}
        </div>
      </Tooltip>
    </>
  );
}

export default DisparitasData;
