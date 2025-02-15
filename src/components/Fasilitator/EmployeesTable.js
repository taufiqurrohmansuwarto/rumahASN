import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getAllEmployeesPaging } from "@/services/master.services";
import { capitalizeWords } from "@/utils/client-utils";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Flex,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useRouter } from "next/router";
import EmployeesTableFilter from "../Filter/EmployeesTableFilter";
import DownloadASN from "./DownloadASN";
import DownloadDokumenFasilitator from "./DownloadDokumenFasilitator";

const TagKomparasi = ({ komparasi, nama }) => {
  return (
    <Tag
      icon={komparasi ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
      color={komparasi ? "success" : "error"}
    >
      {nama}
    </Tag>
  );
};

function EmployeesTable() {
  const router = useRouter();
  useScrollRestoration();

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
      title: "Nama",
      dataIndex: "nama_master",
      responsive: ["xs"],
      render: (_, row) => {
        return (
          <div>
            <Flex gap={8} vertical align="start">
              <Avatar size={50} shape="square" src={row?.foto} alt="foto" />
              <Typography.Text>{row?.nama_master}</Typography.Text>
              <Typography.Text>{row?.nip_master}</Typography.Text>
              <Tooltip title="Pembetulan dilakukan di SIASN">
                <Tag color="yellow">{row?.siasn?.status}</Tag>
              </Tooltip>
              <Tooltip title="Perbaikan dilakukan dengan menambahkan riwayat jabatan SIASN">
                <Tag color="cyan">{row?.siasn?.jenjang_jabatan}</Tag>
              </Tooltip>
            </Flex>
            <Flex
              gap={2}
              style={{
                marginTop: 8,
              }}
              wrap="wrap"
            >
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
            </Flex>
          </div>
        );
      },
    },
    {
      title: "Foto",
      key: "foto",
      responsive: ["sm"],
      width: 100,
      render: (row) => (
        <Avatar size={100} shape="square" src={row?.foto} alt="foto" />
      ),
    },
    {
      title: "Informasi",
      key: "informasi",
      responsive: ["sm"],
      width: 200,
      render: (_, row) => {
        return (
          <Space direction="vertical" size="small">
            <Typography.Text>{row?.nama_master}</Typography.Text>
            <Typography.Text>{row?.nip_master}</Typography.Text>
            <Tooltip title="Pembetulan dilakukan di SIASN">
              <Tag color="yellow">{row?.siasn?.status}</Tag>
            </Tooltip>
            <Tooltip title="Perbaikan dilakukan dengan menambahkan riwayat jabatan SIASN">
              <Tag color="cyan">{row?.siasn?.jenjang_jabatan}</Tag>
            </Tooltip>
          </Space>
        );
      },
    },

    {
      title: "Jabatan",
      key: "jabatan",
      responsive: ["sm"],
      render: (row) => {
        return (
          <Space direction="vertical" size="small">
            <Space size="small">
              {row?.jenis_jabatan}
              {row?.golongan_master}
            </Space>
            <div>{row?.jabatan_master}</div>
            <div>{capitalizeWords(row?.siasn?.nama_jabatan)}</div>
          </Space>
        );
      },
    },
    {
      title: "Jenjang/Pendidikan",
      key: "jenjang_pendidikan_master",
      responsive: ["sm"],
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
      responsive: ["sm"],
      width: 200,
    },
    {
      title: "Unor SIASN",
      key: "unor_siasn",
      responsive: ["sm"],
      width: 200,
      render: (row) => <div>{row?.siasn?.unor}</div>,
    },
    {
      title: "Hasil Validasi",
      key: "hasil",
      responsive: ["sm"],
      width: 100,
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
      responsive: ["sm"],
      render: (row) => {
        return <a onClick={() => gotoDetail(row?.nip_master)}>Detail</a>;
      },
    },
  ];

  return (
    <div>
      <div
        style={{
          border: "1px solid #f0f0f0",
          padding: 16,
          marginTop: 16,
          marginBottom: 16,
        }}
      >
        <EmployeesTableFilter />
        <Flex gap="small">
          <DownloadASN />
          <DownloadDokumenFasilitator />
        </Flex>
      </div>
      <Table
        columns={columns}
        dataSource={data?.results}
        pagination={{
          size: "small",
          total: data?.total,
          showTotal: (total) => `Total ${total} pegawai`,
          showSizeChanger: false,
          current: parseInt(router?.query?.page),
          defaultCurrent: 1,
          onChange: handleChangePage,
          pageSize: 10,
          position: ["topRight", "bottomRight"],
        }}
        loading={isLoading || isFetching}
        rowKey={(row) => row?.id}
      />
    </div>
  );
}

export default EmployeesTable;
