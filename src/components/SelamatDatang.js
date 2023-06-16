import { Alert, Button, Divider, Skeleton, Typography, Space } from "antd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

const MyText = ({ user }) => {
  const router = useRouter();

  const handleCreate = () => {
    router.push("/tickets/create");
  };

  const handleCheckIP = () => {
    router.push("/layanan-tracking/siasn");
  };

  return (
    <>
      <Typography.Text>
        Selamat datang di Rumah ASN BKD Provinsi Jawa Timur! Sebelum bertanya,
        silakan periksa menu{" "}
        <Link href={"/faq"}>
          <a>Pertanyaan Umum</a>
        </Link>{" "}
        dan daftar pertanyaan yang sudah ada. Jika belum menemukan jawaban,
        jangan ragu untuk membuat pertanyaan baru. Kami siap membantu!{" "}
      </Typography.Text>
      <Divider />
      <Space>
        <Button onClick={handleCreate} type="primary">
          Buat Pertanyaan
        </Button>
        {/* {user?.group === "MASTER" && (
          <Button danger type="primary" onClick={handleCheckIP}>
            Check IP ASN
          </Button>
        )} */}
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
