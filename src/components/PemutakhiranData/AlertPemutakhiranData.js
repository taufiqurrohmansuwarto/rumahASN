import { Modal, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function AlertPemutakhiranData() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const modalShownKey = localStorage.getItem("hasShownModal") || false;
  const router = useRouter();

  useEffect(() => {
    // Cek apakah modal sudah ditampilkan sebelumnya
    const hasShownModal = localStorage.getItem("hasShownModal");

    if (!!hasShownModal) {
      // Tampilkan modal
      setIsModalVisible(true);
      // Simpan tanda di local storage bahwa modal sudah ditampilkan
      localStorage.setItem("hasShownModal", "true");
    }

    // Handler untuk perubahan rute
    const handleRouteChange = () => {
      localStorage.setItem("hasShownModal", "false");
    };

    // Pasang event listener untuk perubahan rute
    router.events.on("routeChangeStart", handleRouteChange);

    // Bersihkan event listener saat komponen dilepas
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router, modalShownKey]);

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <Modal
        title="Ingin melakukan Peremajaan Data?"
        open={isModalVisible}
        onOk={handleOk}
        centered
        onCancel={handleCancel}
      >
        <Typography.Text>
          Halo sobat ASN sebelum bertanya tentang peremajaan data SIASN, yuk
          baca dulu di tutorial peremajaan data SIASN khususnya para Guru :){" "}
          <Link href="/layanan/pemutakhiran-data-siasn">
            <a>disini</a>
          </Link>
        </Typography.Text>
      </Modal>
    </div>
  );
}

export default AlertPemutakhiranData;
