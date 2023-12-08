import { dataPangkatByNip } from "@/services/siasn-services";
import { findPangkat } from "@/utils/client-utils";
import { Divider, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Modal, Table } from "antd";
import { orderBy } from "lodash";
import moment from "moment";

const PangkatSiasn = ({ data, isLoading }) => {
  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <>
            {row?.path?.[858] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[858]?.dok_uri}`}
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
      title: "Pangkat",
      key: "Pangkat",
      render: (_, record) => <>{findPangkat(record?.golonganId)}</>,
    },
    {
      title: "No. SK",
      dataIndex: "skNomor",
    },
    {
      title: "TMT Golongan",
      key: "tmt_golongan",
      render: (text) => <>{moment(text?.tmtGolongan).format("DD-MM-YYYY")}</>,
    },

    {
      title: "Tgl. SK",
      dataIndex: "skTanggal",
    },
  ];
  return (
    <>
      <Table
        loading={isLoading}
        columns={columns}
        title={() => <div>RIWAYAT PANGKAT SIASN</div>}
        pagination={false}
        dataSource={orderBy(
          data,
          [
            (o) => {
              return moment(o.tmtGolongan).valueOf();
            },
          ],
          ["desc"]
        )}
        rowKey={(row) => row?.id}
      />
    </>
  );
};

const PangkatSimaster = ({ data, isLoading }) => {
  const columns = [
    {
      title: "File",
      key: "file",
      render: (text) => {
        return (
          <>
            {text?.file_pangkat && (
              <a href={text?.file_pangkat} target="_blank" rel="noreferrer">
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Pangkat",
      key: "pangkat",
      render: (text) => <span>{text?.pangkat?.pangkat}</span>,
    },
    {
      title: "No. SK",
      dataIndex: "no_sk",
    },
    {
      title: "TMT Pangkat",
      dataIndex: "tmt_pangkat",
    },
    {
      title: "Tgl. SK",
      dataIndex: "tgl_sk",
    },
    {
      title: "Aktif",
      dataIndex: "aktif",
    },
  ];
  return (
    <>
      <Table
        loading={isLoading}
        title={() => <span>RIWAYAT DATA PANGKAT SIMASTER</span>}
        pagination={false}
        columns={columns}
        dataSource={data}
        rowKey={(row) => row?.id}
      />
    </>
  );
};

function ModalDetailKP({ open, onCancel, data }) {
  const { data: dataPadanan, isLoading } = useQuery(
    ["data-riwayat-pangkat", data?.nipBaru],
    () => dataPangkatByNip(data?.nipBaru)
  );
  return (
    <Modal
      centered={true}
      title="Detail Pegawai"
      width={850}
      bodyStyle={{ overflowY: "auto", maxHeight: "calc(100vh - 400px)" }}
      open={open}
      onCancel={onCancel}
    >
      {JSON.stringify(data?.id)}
      <Stack>
        <PangkatSimaster
          isLoading={isLoading}
          data={dataPadanan?.pangkat_simaster}
        />
        <PangkatSiasn isLoading={isLoading} data={dataPadanan?.pangkat_siasn} />
      </Stack>
    </Modal>
  );
}

export default ModalDetailKP;
