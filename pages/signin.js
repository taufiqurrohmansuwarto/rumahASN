import { LoginOutlined } from "@ant-design/icons";
import { Blockquote } from "@mantine/core";
import { Button, Col, Divider, Row, Space, Typography } from "antd";
import { getProviders, signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import GoogleButton from "react-google-button";

const SignIn = ({ providers }) => {
  return (
    <>
      <Head>
        <title>Konsultasi Online</title>
      </Head>
      <Row
        style={{ minHeight: "100vh", padding: 16 }}
        align="middle"
        justify="center"
      >
        <Col md={6} xs={24}>
          <Image
            alt="Mountains"
            src="https://siasn.bkd.jatimprov.go.id:9000/public/helpdesk-title.png"
            width={550}
            height={600}
          />
        </Col>
        <Col md={8} xs={24}>
          <Typography.Title>Konsultasi Kepegawaian Online</Typography.Title>
          <Blockquote cite="- BKD Provinsi Jawa Timur">
            Kami hadir untuk melayani dan membantu masyarakat. Lewat konsultasi
            online Badan Kepegawaian Daerah Provinsi Jawa Timur, kami siap
            memberikan solusi dan jawaban terbaik untuk setiap pertanyaan dan
            kebutuhan kamu terkait karier sebagai ASN di Jawa Timur. Jadilah
            bagian dari ASN yang berkualitas dan berintegritas!
          </Blockquote>
          <Row>
            <Col md={24} xs={24}>
              <GoogleButton
                style={{ width: "100%" }}
                label="Masuk dengan Google"
                onClick={() => signIn("google")}
              />
            </Col>
            <Col xs={24}>
              <Divider plain>
                atau punya akun Pegawai Provinsi Jawa Timur?
              </Divider>
            </Col>
            <Col xs={24}>
              <Row gutter={[4, 8]}>
                {Object?.values(providers).map((provider) => (
                  <Col xs={24} md={24} key={provider.id}>
                    {provider?.id !== "google" && (
                      <Button
                        icon={<LoginOutlined />}
                        type="primary"
                        onClick={() => signIn(provider.id)}
                        block
                      >
                        Masuk dengan akun {provider.name}
                      </Button>
                    )}
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
          <Divider />
          <div>
            <Space size="small">
              <Image
                alt="pemprov"
                src="https://siasn.bkd.jatimprov.go.id:9000/public/pemprov.png"
                width={15}
                height={20}
              />
              <Image
                alt="logobkd"
                src="https://siasn.bkd.jatimprov.go.id:9000/public/logobkd.jpg"
                width={30}
                height={40}
              />
            </Space>
          </div>
          <Space direction="vertical" size="small">
            <Typography.Text
              type="secondary"
              style={{
                fontSize: 12,
              }}
            >
              &#169; 2023 BKD Provinsi Jawa Timur
            </Typography.Text>
          </Space>
        </Col>
      </Row>
    </>
  );
};

export async function getServerSideProps() {
  const providers = await getProviders();

  return {
    props: {
      providers,
    },
  };
}

export default SignIn;
