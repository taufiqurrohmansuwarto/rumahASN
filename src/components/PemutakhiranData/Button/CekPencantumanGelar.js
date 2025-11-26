import { ReloadOutlined } from "@ant-design/icons";
import { Button, Flex, Modal } from "antd";
import { Badge, Tooltip } from "@mantine/core";
import { IconCertificate } from "@tabler/icons-react";
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
    queryKey: ["cek-pencantuman-gelar", nip || "personal"],
    queryFn: () =>
      nip
        ? cekPencantumanGelarSiasnByNip(nip)
        : cekPencantumanGelarSiasnPersonal(),
    refetchOnWindowFocus: false,
    enabled: isModalOpen,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <Tooltip label="Cek data pencantuman gelar di SIASN">
        <Badge
          color="teal"
          variant="light"
          leftSection={<IconCertificate size={12} />}
          style={{ cursor: "pointer" }}
          onClick={handleOpenModal}
        >
          Cek Pencantuman Gelar
        </Badge>
      </Tooltip>

      <Modal
        title="Cek Pencantuman Gelar"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        centered
      >
        <Flex justify="flex-end" style={{ marginBottom: 12 }}>
          <Button
            type="default"
            size="small"
            icon={<ReloadOutlined />}
            loading={isFetching}
            onClick={() => refetch()}
      >
            Refresh
          </Button>
        </Flex>
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
