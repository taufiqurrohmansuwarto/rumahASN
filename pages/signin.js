import Features from "@/components/Features";
import Footer from "@/components/Outer/Footer";
import LoginSimaster from "@/components/TombolLogin/LoginSimaster";
import TombolLoginSimaster from "@/components/TombolLogin/TombolLoginSimaster";
import UserRating from "@/components/UserRating";
import { IdcardOutlined } from "@ant-design/icons";
import { Center } from "@mantine/core";
import { useSpring } from "@react-spring/web";
import { IconBarcode, IconKey, IconUserPlus } from "@tabler/icons";
import { Button, Col, Divider, FloatButton, Grid, Row, Space } from "antd";
import { getProviders, signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
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
      src={"https://siasn.bkd.jatimprov.go.id:9000/public/signin_ba.png"}
      width={500}
      height={680}
    />
  );
};

const SignIn = ({ providers }) => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  const gotoNetralitas = () => {
    router.push("/netralitas");
  };

  const loginWithGoogle = (e) => {
    e?.preventDefault();
    signIn("google");
  };

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
          <Row
            style={{
              paddingLeft: breakPoint.xs ? 16 : null,
              paddingRight: breakPoint.xs ? 16 : null,
            }}
          >
            <Col md={24} xs={24}>
              <Center>
                <Space align="center" direction="vertical">
                  <Image
                    alt="Logo Rumah ASN"
                    src={
                      "https://siasn.bkd.jatimprov.go.id:9000/public/signin_logo.png"
                    }
                    height={120}
                    width={350}
                  />
                  {/* <Image
                    alt="Logo Rumah ASN"
                    src={
                      "https://siasn.bkd.jatimprov.go.id:9000/public/signin_bsre.png"
                    }
                    height={30}
                    width={80}
                  /> */}
                </Space>
              </Center>
              <Divider plain>Anda masyarakat umum?</Divider>
              <GoogleButton
                label="Masuk dengan Google"
                onClick={loginWithGoogle}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24}>
              <Divider plain>
                atau anda pegawai Pemerintah Provinsi Jawa Timur?
              </Divider>
            </Col>
            <Col xs={24}>
              <Row gutter={[16, 10]}>
                {Object?.values(providers).map((provider) => (
                  <Col xs={24} md={24} key={provider.id}>
                    {provider?.id !== "google" && (
                      <TombolLoginSimaster
                        size="large"
                        icon={<LoginSimaster />}
                        type="primary"
                        onClick={(e) => {
                          e?.preventDefault();
                          signIn(provider.id);
                        }}
                        block
                        text={`Masuk dengan ${provider.name}`}
                      />
                    )}
                  </Col>
                ))}
                <Button block onClick={gotoNetralitas}>
                  Lapor Netralitas
                </Button>
              </Row>
            </Col>
          </Row>
          <Divider />
          {/* <Row
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
          </Row> */}
          <Center>
            <Space>
              <Link href="/public/verify-pdf">
                <Button size="small" icon={<IconKey size={14} />}>
                  Verifikasi PDF
                </Button>
              </Link>
              <Link href="/guest-book-barcode/checkin">
                <Button size="small" icon={<IconBarcode size={14} />}>
                  Kedatangan Tamu
                </Button>
              </Link>
              <Link href="/public/cek-meja-verif">
                <Button size="small" icon={<IdcardOutlined size={14} />}>
                  Cek Meja Verifikasi
                </Button>
              </Link>
            </Space>
          </Center>
          <Center style={{ marginTop: 10 }}>
            <Space>
              <Link href="/public/pendataan-fasilitator">
                <Button size="small" icon={<IconUserPlus size={14} />}>
                  Pendataan Fasilitator
                </Button>
              </Link>
            </Space>
          </Center>
        </Col>
      </Row>
      <Features title={title} description={description} />
      <UserRating />
      <Footer />
      <FloatButton.BackTop />
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
