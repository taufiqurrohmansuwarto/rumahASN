import { getAllEmployeesPagingAdmin } from "@/services/master.services";
import { capitalizeWords } from "@/utils/client-utils";
import {
  CheckCircleOutlined,
  CloseOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Badge } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Space, Table, Tag, Tooltip, Typography } from "antd";
import { useRouter } from "next/router";
import ReportEmployeeMaster from "../Admin/ReportEmployeeMaster";
import EmployeesTableFilterAdmin from "../Filter/EmployeesTableFilterAdmin";

const TagKomparasi = ({ komparasi, nama }) => {
  return (
    <Badge
      leftSection={komparasi ? <CheckCircleOutlined /> : <CloseOutlined />}
      color={komparasi ? "green" : "red"}
    >
      {nama}
    </Badge>
  );
};

function EmployeesTableAdmin() {
  const router = useRouter();

  const { data, isLoading, isFetching } = useQuery(
    ["employees-paging-admin", router?.query],
    () => getAllEmployeesPagingAdmin(router?.query),
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
    router.push(`/rekon/pegawai/${nip}/detail`);
  };

  const columns = [
    {
      title: "Foto",
      key: "foto",
      width: 100,
      render: (row) => (
        <Avatar size={100} shape="square" src={row?.foto} alt="foto" />
      ),
      fixed: true,
    },
    {
      title: "Informasi",
      key: "informasi",
      fixed: true,
      width: 200,
      render: (_, row) => {
        return (
          <Space direction="vertical" size="small">
            <Typography.Link
              strong
              onClick={() =>
                router.push(`/rekon/pegawai/${row?.nip_master}/detail`)
              }
            >
              {row?.nama_master}
            </Typography.Link>
            <Typography.Text>{row?.nip_master}</Typography.Text>
            <Tooltip title="Pembetulan dilakukan di SIASN">
              <Badge color="yellow">{row?.siasn?.status}</Badge>
            </Tooltip>
            <Tooltip title="Perbaikan dilakukan dengan menambahkan riwayat jabatan SIASN">
              <Badge color="cyan">{row?.siasn?.jenjang_jabatan}</Badge>
            </Tooltip>
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
            <Space size="small">
              {row?.jenis_jabatan}
              {row?.golongan_master}
            </Space>
            <Tag>{row?.jabatan_master || "Tidak ada"}</Tag>
            <Tag>{capitalizeWords(row?.siasn?.nama_jabatan)}</Tag>
          </Space>
        );
      },
    },
    {
      title: "Jenjang/Pendidikan",
      key: "jenjang_pendidikan_master",
      render: (row) => (
        <Space direction="vertical" size="small">
          {row?.jenjang_master || "SIMASTER Kosong"}
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
      width: 200,
    },
    {
      title: "Unor SIASN",
      key: "unor_siasn",
      width: 200,
      render: (row) => <div>{row?.siasn?.unor}</div>,
    },
    {
      title: "Hasil Validasi",
      key: "hasil",
      // width: 100,
      render: (row) => {
        return (
          <Space direction="vertical" size="small">
            <Space size="smal">
              <Tooltip title="Perbaikan dapat dilakukan dengan usulan perubahan nama">
                <div>
                  <TagKomparasi
                    komparasi={row?.komparasi?.nama}
                    nama={"Nama"}
                  />
                </div>
              </Tooltip>
              <Tooltip title="Perbaikan dapat dilakukan dengan usulan perubahan nip">
                <div>
                  <TagKomparasi komparasi={row?.komparasi?.nip} nama={"NIP"} />
                </div>
              </Tooltip>
              <Tooltip title="Perbaikan dapat dilakukan dengan usulan perubahan tanggal lahir">
                <div>
                  <TagKomparasi
                    komparasi={row?.komparasi?.tanggal_lahir}
                    nama={"Tanggal Lahir"}
                  />
                </div>
              </Tooltip>

              <Tooltip title="Perbaikan dapat dilakukan dengan melakukan verifikas NIK di SIASN atau MyASN Personal">
                <div>
                  <TagKomparasi komparasi={row?.siasn?.valid_nik} nama="NIK" />
                </div>
              </Tooltip>
            </Space>
            <Space size="smal">
              <Tooltip title="Perbaikan dapat dilakukan dengan melakukan perubahan email di SIASN">
                <div>
                  <TagKomparasi
                    komparasi={row?.komparasi?.email}
                    nama="Email"
                  />
                </div>
              </Tooltip>
              <TagKomparasi
                komparasi={row?.komparasi?.pangkat}
                nama="Pangkat"
              />
              <Tooltip title="Apabila tidak sesuai dapat dilakukan usulan pencantuman gelar">
                <div>
                  <TagKomparasi
                    komparasi={row?.komparasi?.pendidikan}
                    nama="Pendidikan"
                  />
                </div>
              </Tooltip>
              {row?.status_master !== "PPPK" && (
                <Tooltip title="Dapat dilakukan pembetulan di peremajaan data SIASN/Rumah ASN">
                  <div>
                    <TagKomparasi
                      komparasi={row?.komparasi?.jenjang_jabatan}
                      nama="Jenjang Jabatan"
                    />
                  </div>
                </Tooltip>
              )}
            </Space>
          </Space>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (row) => {
        return (
          <a onClick={() => gotoDetail(row?.nip_master)}>
            <Tooltip title="Lihat">
              <SearchOutlined />
            </Tooltip>
          </a>
        );
      },
    },
  ];

  return (
    <div>
      <div
        style={{
          border: "1px solid #f0f0f0",
          padding: 10,
        }}
      >
        <EmployeesTableFilterAdmin />
        <ReportEmployeeMaster />
      </div>
      <Table
        size="middle"
        columns={columns}
        dataSource={data?.results}
        pagination={{
          total: data?.total,
          showTotal: (total) => `Total ${total} pegawai`,
          showSizeChanger: false,
          position: ["bottomRight", "topRight"],
          current: parseInt(router?.query?.page),
          defaultCurrent: 1,
          onChange: handleChangePage,
        }}
        loading={isLoading || isFetching}
        rowKey={(row) => row?.id}
      />
    </div>
  );
}

export default EmployeesTableAdmin;
