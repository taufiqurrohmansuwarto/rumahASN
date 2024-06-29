import { getUserAnomali2023 } from "@/services/anomali.services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Modal, Typography } from "antd";
import { useEffect, useState } from "react";

function ModalUserAnomali() {
  const { data, isLoading } = useQuery(
    ["anomali-user"],
    () => getUserAnomali2023(),
    {}
  );

  const [openModal, setOpenModal] = useState(false);

  const handleCloseModal = () => setOpenModal(false);

  useEffect(() => {
    if (data && data?.length > 0) {
      setOpenModal(true);
    }
  }, [data]);

  return (
    <>
      <Modal
        footer={null}
        title="Peringatan"
        open={openModal}
        onCancel={handleCloseModal}
      >
        <Stack>
          <div>
            <Typography.Text>
              Ooops.. Anda memiliki anomali di dalam akun anda. Segera Lakukan
              Penyelesaian di menu integrasi MyASN
            </Typography.Text>
          </div>
          <div>
            {data?.map((item, index) => (
              <div key={item.id}>
                <Typography.Text strong>
                  {index + 1}. {item.jenis_anomali_nama}
                </Typography.Text>
              </div>
            ))}
          </div>
        </Stack>
      </Modal>
    </>
  );
}

export default ModalUserAnomali;
