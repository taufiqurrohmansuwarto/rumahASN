import ModalDetailKP from "@/components/LayananSIASN/ModalDetailKP";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getDaftarKenaikanPangkatByPeriode } from "@/services/siasn-services";
import {
  findGolongan,
  findPangkat,
  setColorStatusUsulan,
} from "@/utils/client-utils";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { BackTop, Card, DatePicker, Input, Table, Tag } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

const DaftarKenaikanPangkat = () => {
  const router = useRouter();

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

  const [filteredData, setFilteredData] = useState([]);

  const { data, isLoading, status } = useQuery(
    ["kenaikan-pangkat", dayjs(router?.query?.periode).format("YYYY-MM-DD")],
    () =>
      getDaftarKenaikanPangkatByPeriode(
        dayjs(router?.query?.periode).format("YYYY-MM-DD")
      ),
    {
      enabled: !!router?.query?.periode,
    }
  );

  useEffect(() => {
    if (status === "success") {
      setFilteredData(data?.data);
    }
  }, [status, data]);

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
      render: (_, row) => (
        <span>
          {findPangkat(row?.golonganBaruId)} - (
          {findGolongan(row?.golonganBaruId)})
        </span>
      ),
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

  const handleSearch = (value) => {
    const filteredData = data?.data?.filter((d) => {
      return (
        d?.nama?.toLowerCase().includes(value.toLowerCase()) ||
        d?.nipBaru?.toLowerCase().includes(value.toLowerCase()) ||
        d?.statusUsulanNama?.toLowerCase().includes(value.toLowerCase())
      );
    });
    setFilteredData(filteredData);
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Daftar Kenaikan Pangkat</title>
      </Head>
      <PageContainer title="Daftar Kenaikan Pangkat" content="Layanan SIASN">
        <BackTop />
        <ModalDetailKP
          open={openKPModal}
          data={dataKP}
          onCancel={handleClose}
        />
        <Stack>
          <DatePicker
            value={
              router?.query?.periode
                ? dayjs(router?.query?.periode)
                : dayjs(date)
            }
            format="YYYY-MM-DD"
            onChange={(date) => {
              setDate(date);
              router.push({
                pathname: router.pathname,
                query: { periode: dayjs(date).format("YYYY-MM-DD") },
              });
            }}
          />
          <Card
            title={
              `Periode - ${dayjs(router?.query?.periode).format(
                "DD MMMM YYYY"
              )}` || "-"
            }
          >
            <Table
              title={() => (
                <Input.Search
                  onSearch={handleSearch}
                  placeholder="Cari NIP / Nama / Status Usulan"
                  style={{
                    width: 300,
                  }}
                />
              )}
              size="small"
              columns={columns}
              dataSource={filteredData}
              loading={isLoading}
              pagination={{
                position: ["bottomRight", "topRight"],
                total: filteredData?.length,
                pageSize: 20,
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} Data`,
              }}
            />
          </Card>
        </Stack>
      </PageContainer>
    </>
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
