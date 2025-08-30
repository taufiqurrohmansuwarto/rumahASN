import { InfoCircleOutlined, SettingOutlined } from "@ant-design/icons";
import { Tag, Modal, Flex } from "antd";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  cekPencantumanGelarSiasnPersonal,
  cekPencantumanGelarSiasnByNip,
} from "@/services/siasn-services";
import TabelRiwayatUsulanPencantumanGelar from "@/components/PemutakhiranData/Tables/TabelRiwayatUsulanPencantumanGelar";

const CekPencantumanGelar = ({ nip }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["cek-pencantuman-gelar", nip],
    queryFn: () =>
      nip
        ? cekPencantumanGelarSiasnByNip(nip)
        : cekPencantumanGelarSiasnPersonal(),
    refetchOnWindowFocus: false,
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <Tag
        color="lime"
        icon={<InfoCircleOutlined />}
        style={{ cursor: "pointer" }}
        onClick={handleOpenModal}
      >
        Cek Pencantuman Gelar
      </Tag>

      <Modal
        title={
          <Flex align="center" gap={8}>
            <SettingOutlined style={{ color: "#FF4500" }} />
            <span style={{ color: "#1A1A1B" }}>Cek Pencantuman Gelar</span>
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
        <TabelRiwayatUsulanPencantumanGelar
          data={data}
          isLoading={isLoading || isFetching}
          refetch={refetch}
        />
      </Modal>
    </>
  );
};

export default CekPencantumanGelar;
