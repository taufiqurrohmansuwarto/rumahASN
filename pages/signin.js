import AppRating from "@/components/Outer/AppRating";
import { LoginOutlined } from "@ant-design/icons";
import { Blockquote } from "@mantine/core";
import { Button, Col, Divider, Row, Space, Typography } from "antd";
import { getProviders, signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import GoogleButton from "react-google-button";
import { useSpring, animated } from "@react-spring/web";

const BAComponent = () => {
  const [props, api] = useSpring(
    () => ({
      from: {
        opacity: 0,
      },
      to: {
        opacity: 1,
      },
      delay: 500,
    }),
    []
  );

  return (
    <animated.div style={props}>
      <Image
        alt="Rumah ASN Brand Ambassador"
        src="https://siasn.bkd.jatimprov.go.id:9000/public/layanan-online.png"
        width={700}
        height={500}
      />
    </animated.div>
  );
};

const SignIn = ({ providers }) => {
  const textAnimation = useSpring({
    from: { marginLeft: -100 },
    to: { marginLeft: 0 },
    config: { duration: 1000 },
  });

  return (
    <>
      <Head>
        <title>
          Rumah ASN by BKD Provinsi Jawa Timur - Ruang Menjawab Keluhan ASN Jawa
          Timur dan Masyarakat UMUM
        </title>
        <meta name="description" content="Rumah ASN" />
      </Head>
      <Row
        style={{ minHeight: "75vh", padding: 16 }}
        align="middle"
        justify="center"
      >
        <Col md={9} xs={24}>
          <BAComponent />
        </Col>
        <Col md={6} xs={24}>
          <animated.div style={textAnimation}>
            <Typography.Title level={2}>Rumah ASN</Typography.Title>
          </animated.div>
          <Blockquote cite="- BKD Provinsi Jawa Timur">
            Tempat Berkumpulnya Solusi Kepegawaian yang Cepat, Mudah, dan
            Terpadu untuk Menciptakan Lingkungan Kerja yang Harmonis dan
            Produktif
          </Blockquote>
          <Row>
            <Col md={24} xs={24}>
              <Divider plain>Anda masyarakat umum?</Divider>
              <GoogleButton
                style={{ width: "100%" }}
                label="Masuk dengan Google"
                onClick={() => signIn("google")}
              />
            </Col>
            <Col xs={24}>
              <Divider plain>
                atau anda pegawai Pemerintah Provinsi Jawa Timur?
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
              <Image
                alt="logo-rumahasn"
                src="https://siasn.bkd.jatimprov.go.id:9000/public/rumah-asn-logo.png"
                width={20}
                height={25}
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
              &#169; 2022 Desain & Pengembangan | BKD Provinsi Jawa Timur
            </Typography.Text>

            <Space>
              <Link href="/changelog">
                <Typography.Link
                  style={{
                    fontSize: 12,
                  }}
                >
                  Ver 1.0.0-rc 12
                </Typography.Link>
              </Link>
              <Link href="/privacy">
                <Typography.Link
                  style={{
                    fontSize: 12,
                  }}
                >
                  Kebijakan dan Privasi
                </Typography.Link>
              </Link>
            </Space>
          </Space>
        </Col>
      </Row>
      <AppRating />
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
