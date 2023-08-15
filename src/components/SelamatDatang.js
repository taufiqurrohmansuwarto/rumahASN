import { Alert, Button, Divider, Skeleton, Typography, Space } from "antd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const MyText = ({ user }) => {
  const router = useRouter();

  const handleCreate = () => {
    router.push("/tickets/create");
  };

  const handleCheckIP = () => {
    router.push("/pemutakhiran-data/komparasi");
  };

  return (
    <>
      <Typography.Text>
        Halo, Sobat ASN! Selamat datang di Rumah ASN BKD Provinsi Jawa Timur!
        Sebelum nyelonong tanya, coba deh mampir dulu ke menu{" "}
        <Link href={"/faq"}>
          <a>Pertanyaan Umum</a>
        </Link>{" "}
        atau lihat-lihat daftar pertanyaan yang udah ada. Kalo jawabannya masih
        ngambang, yuk langsung gas pol buat pertanyaan baru. Tenang aja, kita
        disini selalu siap bantu kalian, sob! Semangat terus, ya!{" "}
      </Typography.Text>
      <Divider />
      <Space>
        <Button onClick={handleCreate} type="primary">
          Buat Pertanyaan
        </Button>
        {user?.group === "MASTER" && (
          <Button danger type="primary" onClick={handleCheckIP}>
            Peremajaan Data
          </Button>
        )}
      </Space>
    </>
  );
};

function SelamatDatang() {
  const { data, status } = useSession();

  return (
    <Skeleton loading={status === "loading"}>
      <Alert
        showIcon
        banner
        description={<MyText user={data?.user} />}
        type="success"
      />
    </Skeleton>
  );
}

export default SelamatDatang;
