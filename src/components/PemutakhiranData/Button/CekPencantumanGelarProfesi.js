import TabelRiwayatUsulanPencantumanGelar from "@/components/PemutakhiranData/Tables/TabelRiwayatUsulanPencantumanGelar";
import {
  cekPencantumanGelarSiasnPersonalProfesi,
  cekPencantumanGelarSiasnProfesiByNip,
} from "@/services/siasn-services";
import { SettingOutlined } from "@ant-design/icons";
import { Badge, Tooltip } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Flex, Modal } from "antd";
import { useState } from "react";
import TableRiwayatUsulanPencantumanGelarProfesi from "@/components/PemutakhiranData/Tables/TableRiwayatUsulanPencantumanGelarProfesi";

const CekPencantumanGelarProfesi = ({ nip }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["cek-pencantuman-gelar-profesi", nip],
    queryFn: () =>
      nip
        ? cekPencantumanGelarSiasnProfesiByNip(nip)
        : cekPencantumanGelarSiasnPersonalProfesi(),
    refetchOnWindowFocus: false,
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <Tooltip label="Cek data pencantuman gelar di SIASN">
        <Badge
          color="orange"
          variant="light"
          leftSection={<IconInfoCircle size={12} />}
          style={{ cursor: "pointer" }}
          onClick={handleOpenModal}
        >
          Cek Pencantuman Gelar Profesi
        </Badge>
      </Tooltip>

      <Modal
        title={
          <Flex align="center" gap={8}>
            <SettingOutlined style={{ color: "#FF4500" }} />
            <span style={{ color: "#1A1A1B" }}>
              Cek Pencantuman Gelar Profesi
            </span>
          </Flex>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        styles={{
          content: {
            backgroundColor: "#DAE0E6",
            padding: "0",
          },
          header: {
            backgroundColor: "#F8F9FA",
            borderBottom: "1px solid #EDEFF1",
            margin: "0",
            padding: "16px 24px",
          },
          body: {
            padding: "16px",
          },
        }}
      >
        <TableRiwayatUsulanPencantumanGelarProfesi
          data={data}
          isLoading={isLoading || isFetching}
          refetch={refetch}
        />
      </Modal>
    </>
  );
};

export default CekPencantumanGelarProfesi;
