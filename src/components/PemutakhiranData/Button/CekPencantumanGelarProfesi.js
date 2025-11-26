import {
  cekPencantumanGelarSiasnPersonalProfesi,
  cekPencantumanGelarSiasnProfesiByNip,
} from "@/services/siasn-services";
import { ReloadOutlined } from "@ant-design/icons";
import { Badge, Tooltip } from "@mantine/core";
import { IconCertificate2 } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, Flex, Modal } from "antd";
import { useState } from "react";
import TableRiwayatUsulanPencantumanGelarProfesi from "@/components/PemutakhiranData/Tables/TableRiwayatUsulanPencantumanGelarProfesi";

const CekPencantumanGelarProfesi = ({ nip }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["cek-pencantuman-gelar-profesi", nip || "personal"],
    queryFn: () =>
      nip
        ? cekPencantumanGelarSiasnProfesiByNip(nip)
        : cekPencantumanGelarSiasnPersonalProfesi(),
    refetchOnWindowFocus: false,
    enabled: isModalOpen,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <>
      <Tooltip label="Cek data pencantuman gelar profesi di SIASN">
        <Badge
          color="orange"
          variant="light"
          leftSection={<IconCertificate2 size={12} />}
          style={{ cursor: "pointer" }}
          onClick={handleOpenModal}
        >
          Cek Pencantuman Gelar Profesi
        </Badge>
      </Tooltip>

      <Modal
        title="Cek Pencantuman Gelar Profesi"
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
