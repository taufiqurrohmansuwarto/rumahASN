import Features from "@/components/Features";
import Footer from "@/components/Outer/Footer";
import UserRating from "@/components/UserRating";
import {
  GlobalOutlined,
  InstagramOutlined,
  LoginOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { Center } from "@mantine/core";
import { useSpring } from "@react-spring/web";
import {
  BackTop,
  Button,
  Col,
  Divider,
  Grid,
  Image,
  Row,
  Space,
  Tooltip,
} from "antd";
import { getProviders, signIn } from "next-auth/react";
import Head from "next/head";
import GoogleButton from "react-google-button";

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
    <Image
      alt="Rumah ASN Brand Ambassador"
      src={"rumah_asn.png"}
      preview={false}
      width={500}
    />
  );
};

const SignIn = ({ providers }) => {
  const breakPoint = Grid.useBreakpoint();

  const title = "Rumah ASN: Sobat Kepegawaian #1 di Jatim";
  const description =
    "Dengerin nih, brosis! Rumah ASN tuh jawabannya buat semua pertanyaan seru seputar dunia kepegawaian di Jawa Timur. Mulai dari info terkini, diskusi hangat, sampe ngobrol santai via podcast, semuanya ada di sini. Kita juga punya fitur unik buat catat segala aktivitas dan data kamu, biar kamu makin mantap jadi ASN yang oke. So, yuk gabung dan rasain serunya jadi bagian dari Rumah ASN!";
  return (
    <>
      <Head>
        <title>
          Rumah ASN by BKD Provinsi Jawa Timur - Ruang Menjawab Keluhan ASN Jawa
          Timur dan Masyarakat UMUM
        </title>
        <meta name="description" content="Rumah ASN" />
      </Head>
      <Row justify="center" align="center">
        <Col md={12} xxl={6} lg={8} xs={24} sm={24}>
          <Center>
            <BAComponent />
          </Center>
        </Col>
        <Col md={12} xxl={5} lg={10} xs={24} sm={24}>
          <Row>
            <Col md={24} xs={24}>
              <Image
                alt="Rumah ASN"
                src={"new_logo.png"}
                preview={false}
                style={{
                  textAlign: "center",
                }}
              />
              <Image
                style={{
                  width: 150,
                  height: "auto",
                }}
                src="https://bsre.bssn.go.id/img/bsre-logo-full.aa4caa4d.png"
                alt="bsre"
              />
              <Divider plain>Anda masyarakat umum?</Divider>
              <GoogleButton
                label="Masuk dengan Google"
                onClick={(e) => {
                  e.preventDefault();
                  signIn("google");
                }}
                style={{
                  width: "100%",
                }}
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
                        onClick={(e) => {
                          e?.preventDefault();
                          signIn(provider.id);
                        }}
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
          <Row
            justify="center"
            style={{
              marginBottom: 20,
            }}
          >
            <Space size="large">
              <Tooltip title="Web BKD Jatim">
                <a
                  target="_blank"
                  href="https://bkd.jatimprov.go.id"
                  rel="noreferrer"
                >
                  <GlobalOutlined
                    style={{
                      fontSize: 32,
                      color: "#d9d9d9",
                      cursor: "pointer",
                    }}
                  />
                </a>
              </Tooltip>

              <Tooltip title="Instagram BKD Jatim">
                <a
                  href="https://www.instagram.com/bkdjatim/?hl=en"
                  target="_blank"
                  rel="noreferrer"
                >
                  <InstagramOutlined
                    style={{
                      fontSize: 32,
                      color: "#d9d9d9",
                      cursor: "pointer",
                    }}
                  />
                </a>
              </Tooltip>

              <Tooltip title="Youtube BKD Jatim">
                <a
                  href="https://www.youtube.com/channel/UCokkbWw9VaJxGp3xqOjbcKg"
                  target="_blank"
                  rel="noreferrer"
                >
                  <YoutubeOutlined
                    style={{
                      fontSize: 32,
                      color: "#d9d9d9",
                      cursor: "pointer",
                    }}
                  />
                </a>
              </Tooltip>
            </Space>
          </Row>
        </Col>
      </Row>
      <Features title={title} description={description} />
      {/* <AppRating /> */}
      <UserRating />
      <Footer />
      <BackTop />
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
