import PageContainer from "@/components/PageContainer";
import { Col, Row, Typography, Breadcrumb } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

function Privacy() {
  const router = useRouter();

  const handleBackMain = () => {
    router.push("/");
  };

  return (
    <PageContainer
      onBack={handleBackMain}
      breadcrumbRender={() => (
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/">
              <a>Beranda</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Kebijakan dan Privasi</Breadcrumb.Item>
        </Breadcrumb>
      )}
      title="Kebijakan Dan Privasi"
    >
      <Row>
        <Col md={16} xs={24}>
          <Typography.Paragraph>
            Kami, sebagai pengembang Aplikasi Rumah ASN, menghargai privasi
            pengguna dan berkomitmen untuk menjaga kerahasiaan informasi pribadi
            yang diberikan oleh pengguna dalam penggunaan aplikasi ini. Oleh
            karena itu, kami telah mengembangkan Kebijakan Privasi sebagai
            panduan untuk mengumpulkan, menggunakan, dan melindungi informasi
            pribadi yang diberikan oleh pengguna.
          </Typography.Paragraph>
          <Typography.Title level={5}>
            1. Pengumpulan Informasi Pribadi Pengguna
          </Typography.Title>
          <Typography.Paragraph>
            Aplikasi Rumah ASN hanya mengumpulkan informasi pribadi yang
            diberikan secara sukarela oleh pengguna saat mendaftar atau
            menggunakan aplikasi ini. Informasi yang dikumpulkan meliputi nama,
            alamat email, NIP (Nomor Induk Pegawai) dan NIPTT (Nomor Induk
            Pegawai Tidak Tetap) yang berlaku, dan informasi yang diperlukan
            untuk menyelesaikan permintaan pengguna dalam layanan Aplikasi Rumah
            ASN.
          </Typography.Paragraph>
          <Typography.Title level={5}>2. Penggunaan Informasi</Typography.Title>
          <Typography.Paragraph>
            Informasi pribadi yang dikumpulkan oleh Aplikasi Rumah ASN hanya
            digunakan untuk tujuan pengelolaan dan penyediaan layanan helpdesk
            kepegawaian. Kami tidak akan membagikan informasi pribadi pengguna
            dengan pihak ketiga tanpa persetujuan pengguna, kecuali diwajibkan
            oleh hukum atau oleh otoritas yang berwenang.
          </Typography.Paragraph>
          <Typography.Title level={5}>3. Keamanan Informasi</Typography.Title>
          <Typography.Paragraph>
            Kami memastikan bahwa informasi pribadi yang diberikan oleh pengguna
            di Aplikasi Rumah ASN aman dan terlindungi. Kami menerapkan tindakan
            pengamanan teknis dan organisasional yang sesuai untuk melindungi
            informasi pribadi dari akses yang tidak sah, penyalahgunaan,
            perubahan, dan penghapusan.
          </Typography.Paragraph>
          <Typography.Title level={5}>
            4. Perubahan Kebijakan Privasi
          </Typography.Title>
          <Typography.Paragraph>
            Kami dapat mengubah kebijakan privasi ini dari waktu ke waktu untuk
            memenuhi kebutuhan pengguna dan perubahan peraturan yang berlaku.
            Setiap perubahan yang dilakukan akan diumumkan melalui aplikasi ini.
            Pengguna disarankan untuk membaca Kebijakan Privasi secara teratur
            untuk mengetahui informasi terbaru tentang bagaimana informasi
            pribadi mereka dikelola.
          </Typography.Paragraph>
          <Typography.Title level={5}>4. Kontak</Typography.Title>
          <Typography.Paragraph>
            Jika pengguna memiliki pertanyaan atau kekhawatiran terkait dengan
            Kebijakan Privasi ini atau pengelolaan informasi pribadi mereka,
            silakan hubungi kami melalui alamat email yang tercantum di
            aplikasi. Kami akan berusaha untuk menanggapi setiap pertanyaan atau
            kekhawatiran secepat mungkin.
          </Typography.Paragraph>
        </Col>
      </Row>
    </PageContainer>
  );
}

export default Privacy;
