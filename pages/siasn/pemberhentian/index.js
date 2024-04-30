import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getDaftarPemberhentianSIASN } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { BackTop, Card, DatePicker, Input, Table } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import dayjs from "dayjs";

dayjs.locale("id");
require("dayjs/locale/id");

const Pemberhentian = () => {
  const router = useRouter();

  const [query, setQuery] = useState({
    tglAwal: router?.query?.tglAwal || dayjs().format("DD-MM-YYYY"),
    tglAkhir: router?.query?.tglAkhir || dayjs().format("DD-MM-YYYY"),
  });

  const [filteredData, setFilteredData] = useState([]);

  const { data, isLoading, status } = useQuery(
    ["pemberhentian", query],
    () => getDaftarPemberhentianSIASN(query),
    {
      enabled: !!query,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (status === "success") {
      setFilteredData(data);
    }
  }, [status, data]);

  const handleDateChange = (date, dateString) => {
    setQuery({
      tglAwal: dateString[0],
      tglAkhir: dateString[1],
    });

    router.push({
      pathname: router.pathname,
      query: {
        tglAwal: dateString[0],
        tglAkhir: dateString[1],
      },
    });
  };

  const columns = [
    {
      title: "File Pertek",
      key: "file_pertek",
      render: (_, record) => {
        return (
          <>
            {record?.pathPertek && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.pathPertek}`}
                target="_blank"
                rel="noreferrer"
              >
                Pertek
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "File SK",
      key: "fileSK",
      render: (_, record) => {
        return (
          <>
            {record?.pathSk && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.pathSk}`}
                target="_blank"
                rel="noreferrer"
              >
                SK
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
            {record?.pathSkPreview && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.pathSkPreview}`}
                target="_blank"
                rel="noreferrer"
              >
                Preview SK
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Status Usulan Nama",
      dataIndex: "statusUsulanNama",
    },
    {
      title: "Nama Instansi",
      dataIndex: "instansiNama",
    },
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "NIP",
      dataIndex: "nipBaru",
    },
    {
      title: "Detail Layanan",
      dataIndex: "detailLayananNama",
    },
    {
      title: "Tanggal SK",
      dataIndex: "skTgl",
    },
    {
      title: "Nomer SK",
      dataIndex: "skNomor",
    },
    {
      title: "Nomer Pertek",
      dataIndex: "pertekNomor",
    },
    {
      title: "Tanggal Pertek",
      dataIndex: "pertekTgl",
    },
    {
      title: "TMT Pensiun",
      key: "tmtPensiun",
      render: (_, row) => {
        return <>{dayjs(row?.tmtPensiun).format("DD-MM-YYYY")}</>;
      },
    },
  ];

  const handleSearch = (e) => {
    const filtered = data?.filter(
      (item) =>
        item?.nama?.toLowerCase().includes(e.toLowerCase()) ||
        item?.nipBaru?.toLowerCase().includes(e.toLowerCase())
    );

    setFilteredData(filtered);
  };

  return (
    <>
      <BackTop />
      <PageContainer title="Layanan SIASN" content="Daftar Pemberhentian SIASN">
        <Head>
          <title>Rumah ASN - Daftar Pemberhentian</title>
        </Head>
        <Card title="Layanan Pensiun">
          <Input.Search
            allowClear
            onSearch={handleSearch}
            style={{
              width: 300,
            }}
          />

          <Table
            title={() => (
              <DatePicker.RangePicker
                allowClear={false}
                value={[
                  dayjs(query.tglAwal, "DD-MM-YYYY"),
                  dayjs(query.tglAkhir, "DD-MM-YYYY"),
                ]}
                onChange={handleDateChange}
                format={"DD-MM-YYYY"}
              />
            )}
            columns={columns}
            loading={isLoading}
            dataSource={filteredData}
            rowKey={(row) => row?.id}
            pagination={{
              total: filteredData?.length,
              showTotal: (total) => `Total ${total} Data`,
              position: ["bottomRight", "topRight"],
            }}
          />
        </Card>
      </PageContainer>
    </>
  );
};

Pemberhentian.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

Pemberhentian.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Pemberhentian;
