import { Alert, Button, Divider, Skeleton, Typography } from "antd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

const MyText = ({ user }) => {
  const router = useRouter();

  const handleCreate = () => {
    router.push("/tickets/create");
  };

  return (
    <>
      <Typography.Text>
        Selamat datang di Pusat Layanan Kepegawaian Jatim! Sebelum bertanya,
        silakan periksa menu{" "}
        <Link href={"/faq"}>
          <a>FAQ</a>
        </Link>{" "}
        dan tiket yang sudah ada. Jika belum menemukan jawaban, jangan ragu
        untuk membuat tiket baru. Kami siap membantu!{" "}
      </Typography.Text>
      <Divider />
      <Button onClick={handleCreate} type="primary">
        Buat Tiket Baru
      </Button>
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