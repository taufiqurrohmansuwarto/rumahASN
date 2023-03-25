import { Alert, Skeleton, Typography } from "antd";
import { useSession } from "next-auth/react";
import Link from "next/link";

const MyText = ({ user }) => {
  return (
    <>
      <Typography.Text>
        Halo kak <Typography.Text strong>{user?.name}</Typography.Text>, Selamat
        datang di Helpdesk kami! 🌟 Kami senang bisa membantu Anda. Sebelum
        mengajukan pertanyaan Anda, kami sarankan Anda untuk memeriksa menu{" "}
        <Link href={"/faq"}>
          <a>FAQ</a>
        </Link>{" "}
        kami untuk informasi umum yang mungkin telah menjawab pertanyaan Anda.
        Jangan lupa untuk juga melihat tiket yang sudah dibuat oleh pengguna
        lain, siapa tahu ada solusi yang relevan untuk Anda. Jika Anda tidak
        menemukan jawaban yang Anda cari, jangan ragu untuk membuat tiket baru.
        Selalu ada untuk membantu Anda! 😊
      </Typography.Text>
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
