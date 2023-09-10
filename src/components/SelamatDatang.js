import { Stack } from "@mantine/core";
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
      <div
        style={{
          marginBottom: 16,
        }}
      >
        <Typography.Text>
          Kunjungi menu{" "}
          <Link href={`/helpdesk/faq`}>
            <a>Pertanyaan Umum</a>
          </Link>{" "}
          atau periksa daftar pertanyaan yang telah ada sebelum mengajukan
          pertanyaan baru.
        </Typography.Text>
        {user?.group === "MASTER" && (
          <Typography.Paragraph strong>
            {" "}
            Untuk melihat komparasi data utama SIMASTER dan SIASN anda silahkan
            klik{" "}
            <Link
              href={`
            /pemutakhiran-data/data-utama
            `}
            >
              <a>di sini.</a>
            </Link>{" "}
            Atau cek status layanan kepegawaian SIASN{" "}
            <Link href={`/pemutakhiran-data/komparasi`}>
              <a>di sini.</a>
            </Link>
          </Typography.Paragraph>
        )}
      </div>

      <Space>
        <Button onClick={handleCreate} type="primary">
          Tanya BKD
        </Button>
      </Space>
    </>
  );
};

function SelamatDatang() {
  const { data, status } = useSession();

  return (
    <Skeleton loading={status === "loading"}>
      <Alert description={<MyText user={data?.user} />} />
    </Skeleton>
  );
}

export default SelamatDatang;
