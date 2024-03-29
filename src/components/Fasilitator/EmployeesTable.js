import { getAllEmployeesPaging } from "@/services/master.services";
import { capitalizeWords } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Space, Table, Tag } from "antd";
import { useRouter } from "next/router";

function EmployeesTable() {
  const router = useRouter();
  const { data, isLoading, isFetching } = useQuery(
    ["employees-paging", router?.query],
    () => getAllEmployeesPaging(router?.query),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const handleChangePage = (page) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page },
    });
  };

  const gotoDetail = (nip) => {
    router.push(`/fasilitator-employees/master-data/${nip}`);
  };

  const columns = [
    {
      title: "Foto",
      key: "foto",
      render: (row) => (
        <Avatar size={80} shape="square" src={row?.foto} alt="foto" />
      ),
    },
    {
      title: "Informasi SIMASTER",
      key: "informasi",
      render: (row) => {
        return (
          <Space direction="vertical" size="small">
            <Tag color={row?.komparasi?.nama ? "green" : "red"}>
              {row?.nama_master}
            </Tag>
            <Tag color={row?.komparasi?.nip ? "green" : "red"}>
              {row?.nip_master}
            </Tag>
            <span>
              {row?.gelar_depan_master} {row?.gelar_belakang_master}
            </span>
            <Tag color={row?.siasn?.valid_nik ? "green" : "red"}>
              {row?.siasn?.valid_nik ? "NIK Valid" : "NIK Tidak Valid"}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Jabatan",
      key: "jabatan",
      render: (row) => {
        return (
          <Space direction="vertical" size="small">
            <Tag>{row?.jenis_jabatan}</Tag>
            <div>{row?.jabatan_master}</div>
            <div>{capitalizeWords(row?.siasn?.nama_jabatan)}</div>
          </Space>
        );
      },
    },
    {
      title: "Pangkat",
      key: "pangkat",
      render: (row) => (
        <Tag color={row?.komparasi?.pangkat ? "green" : "red"}>
          {row?.golongan_master}
        </Tag>
      ),
    },
    {
      title: "Jenjang/Pendidikan",
      key: "jenjang_pendidikan_master",
      render: (row) => (
        <Space direction="vertical" size="small">
          <Tag color={row?.komparasi?.pendidikan ? "green" : "red"}>
            {row?.jenjang_master || "SIMASTER Kosong"}
          </Tag>
          <div>
            {row?.jenjang_master} {row?.prodi_master}
          </div>
          <div>{row?.siasn?.jenjang}</div>
        </Space>
      ),
    },
    {
      title: "Perangkat Daerah",
      dataIndex: "opd_master",
      width: 400,
    },
    {
      title: "Unor SIASN",
      key: "unor_siasn",
      render: (row) => <div>{row?.siasn?.unor}</div>,
    },
    {
      title: "Aksi",
      key: "action",
      render: (row) => {
        return <a onClick={() => gotoDetail(row?.nip_master)}>Detail</a>;
      },
    },
  ];

  return (
    <div>
      <Table
        size="small"
        columns={columns}
        dataSource={data?.results}
        pagination={{
          total: data?.total,
          showTotal: (total) => `Total ${total} pegawai`,
          showSizeChanger: false,
          current: parseInt(router?.query?.page),
          defaultCurrent: 1,
          onChange: handleChangePage,
          position: ["topRight", "bottomRight"],
        }}
        loading={isLoading || isFetching}
        rowKey={(row) => row?.id}
      />
    </div>
  );
}

export default EmployeesTable;
