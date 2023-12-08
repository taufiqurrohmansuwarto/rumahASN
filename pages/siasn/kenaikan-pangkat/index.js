import Layout from "@/components/Layout";
import { getDaftarKenaikanPangkatByPeriode } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { BackTop, Card, DatePicker, Skeleton, Table, Tag } from "antd";
import { useState } from "react";
import moment from "moment";
import { findPangkat, setColorStatusUsulan } from "@/utils/client-utils";
import PageContainer from "@/components/PageContainer";
import { Stack } from "@mantine/core";
import ModalDetailKP from "@/components/LayananSIASN/ModalDetailKP";

const DaftarKenaikanPangkat = () => {
  const [date, setDate] = useState(new Date());

  // modal
  const [openKPModal, setOpenKPModal] = useState(false);
  const [dataKP, setDataKP] = useState(null);

  const handleOpen = (data) => {
    setDataKP(data);
    setOpenKPModal(true);
  };

  const handleClose = () => {
    setOpenKPModal(false);
    setDataKP(null);
  };

  const { data, isLoading } = useQuery(
    ["kenaikan-pangkat", moment(date).format("YYYY-MM-DD")],
    () => getDaftarKenaikanPangkatByPeriode(moment(date).format("YYYY-MM-DD")),
    {
      enabled: !!date,
    }
  );

  const columns = [
    {
      title: "NIP",
      dataIndex: "nipBaru",
    },
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "No. Pertek",
      dataIndex: "no_pertek",
    },
    {
      title: "Tgl Pertek",
      dataIndex: "tgl_pertek",
    },

    {
      title: "No. SK",
      dataIndex: "no_sk",
    },
    {
      title: "Tgl SK",
      dataIndex: "tgl_sk",
    },
    {
      title: "TMT KP",
      dataIndex: "tmtKp",
    },
    {
      title: "Golongan Baru",
      key: "golongan_baru",
      render: (_, row) => <span>{findPangkat(row?.golonganBaruId)}</span>,
    },
    {
      title: "Status Usulan Nama",
      key: "statusUsulanNama",
      render: (_, row) => (
        <Tag color={setColorStatusUsulan(row?.statusUsulan)}>
          {row?.statusUsulanNama}
        </Tag>
      ),
    },
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
      title: "File SK",
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
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        return <a onClick={() => handleOpen(row)}>Detail</a>;
      },
    },
  ];

  return (
    <PageContainer>
      <BackTop />
      <ModalDetailKP open={openKPModal} data={dataKP} onCancel={handleClose} />
      <Stack>
        <DatePicker format="YYYY-MM-DD" onChange={(date) => setDate(date)} />
        <Card>
          <Table
            size="small"
            columns={columns}
            dataSource={data?.data}
            loading={isLoading}
            pagination={{
              position: ["bottomRight, topRight"],
              total: data?.count,
              pageSize: 20,
            }}
          />
        </Card>
      </Stack>
    </PageContainer>
  );
};

DaftarKenaikanPangkat.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

DaftarKenaikanPangkat.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DaftarKenaikanPangkat;
