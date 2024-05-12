import {
  Container,
  SimpleGrid,
  Text,
  ThemeIcon,
  Title,
  createStyles,
  rem,
} from "@mantine/core";
import {
  IconBrand4chan,
  IconBrandAirbnb,
  IconBrandZoom,
  IconCertificate,
  IconChartInfographic,
  IconDatabaseImport,
  IconMessages,
  IconMicrophone,
  IconStar,
  IconUserPlus,
} from "@tabler/icons";

export const MOCKDATA = [
  {
    icon: IconMessages,
    title: "Forum Kepegawaian",
    description:
      "Fitur Forum Kepegawaian Rumah ASN memberikan ruang bagi pengguna untuk berinteraksi, berdiskusi, dan bertukar informasi mengenai berbagai hal yang berkaitan dengan kepegawaian, langsung dengan pejabat BKD yang berkompeten di bidangnya",
  },
  {
    icon: IconStar,
    title: "Penilaian Layanan",
    description:
      "Fitur Penilaian Layanan memungkinkan pengguna untuk memberikan penilaian dan umpan balik terhadap layanan yang diterima dari BKD Provinsi Jawa Timur, yang akan menjadi acuan bagi peningkatan kualitas layanan kami.",
  },
  {
    icon: IconMicrophone,
    title: "Podcast",
    description:
      "Fitur Podcast Rumah ASN menyajikan berbagai topik menarik dan terkini seputar kepegawaian, yang disampaikan langsung oleh pejabat dan staf BKD. Edukasi kepegawaian yang informatif dan menyenangkan.",
  },
  {
    icon: IconDatabaseImport,
    title: "Integrasi Sistem SIASN",
    description:
      "Melalui fitur Integrasi Sistem, pengguna dapat melacak layanan kepegawaian seperti pensiun, perbaikan nama/NIP, dan kenaikan pangkat dengan lebih mudah dan praktis.",
  },
  {
    icon: IconUserPlus,
    title: "Single Sign-On",
    description:
      "Fitur Single Sign-On memudahkan pengguna untuk mengakses Rumah ASN, baik menggunakan akun Gmail untuk masyarakat umum, maupun Single Sign On Kepegawaian untuk pegawai pemerintah Provinsi Jawa Timur.",
  },
  {
    icon: IconCertificate,
    title: "Webinar Series",
    description:
      "Fitur Webinar dari Rumah ASN menawarkan penyampaian edukatif yang tersistemasi. Keunggulan ini diperkuat dengan sertifikat menggunakan TTE, memastikan keabsahan dan kemudahan bagi pengguna. Ini tidak hanya meningkatkan kualitas edukasi, tetapi juga memberikan kepraktisan dan kepercayaan bagi setiap peserta.",
  },
  {
    icon: IconBrandZoom,
    title: "Coaching Clinic",
    description:
      "Pelatihan virtual tentang kepegawaian daerah di platform digital. Setiap sesi dirancang sesuai tema untuk diskusi mendalam dengan ahli BKD. Tujuannya adalah mempermudah informasi dan meningkatkan kualitas pelayanan BKD.",
  },
  {
    icon: IconBrand4chan,
    title: "Smart ASN Connect - ASN Updates",
    description:
      "Hayo, siapa yang pengen eksis? Fitur ini mirip kayak Facebook atau Twitter, tapi khusus buat kalian, para ASN. Di sini bisa loh update status yang informatif dan inspiratif. Share pengalaman atau info bermanfaat yang bisa memotivasi teman-teman ASN lainnya. Jangan lupa, tetap keep it professional ya!",
  },
  {
    icon: IconBrandAirbnb,
    title: "Smart ASN Connect - ASN Discussions",
    description:
      "Udah siap diskusi yang lebih seru dan fokus? Di fitur ini, BKD kasih tema-tema panas untuk dibahas. Dari mulai strategi kerja sampe perkembangan terbaru di sektor pemerintahan, semua bisa jadi topik diskusi. Fitur ini bener-bener designed buat memfasilitasi diskusi yang konstruktif dan menghasilkan ide-ide cemerlang untuk kemajuan bersama.",
  },
];

const Feature = ({ icon: Icon, title, description }) => {
  return (
    <div>
      <ThemeIcon variant="light" size={40} radius={40}>
        <Icon size="1.1rem" stroke={1.5} />
      </ThemeIcon>
      <Text mt="sm" mb={7}>
        {title}
      </Text>
      <Text size="sm" color="dimmed" sx={{ lineHeight: 1.6 }}>
        {description}
      </Text>
    </div>
  );
};

const useStyles = createStyles((theme) => ({
  wrapper: {
    paddingTop: `calc(${theme.spacing.xl} * 4)`,
    paddingBottom: `calc(${theme.spacing.xl} * 4)`,
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 900,
    marginBottom: theme.spacing.md,
    textAlign: "center",

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(28),
      textAlign: "left",
    },
  },

  description: {
    textAlign: "center",

    [theme.fn.smallerThan("sm")]: {
      textAlign: "left",
    },
  },
}));

const Features = ({ title, description, data = MOCKDATA }) => {
  const { classes } = useStyles();
  const features = data.map((feature, index) => (
    <Feature {...feature} key={index} />
  ));

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
      }}
    >
      <Container className={classes.wrapper}>
        <Title className={classes.title}>{title}</Title>

        <Container size={560} p={0}>
          <Text size="sm" className={classes.description}>
            {description}
          </Text>
        </Container>

        <SimpleGrid
          mt={60}
          cols={3}
          spacing={50}
          breakpoints={[
            { maxWidth: 980, cols: 2, spacing: "xl" },
            { maxWidth: 755, cols: 1, spacing: "xl" },
          ]}
        >
          {features}
        </SimpleGrid>
      </Container>
    </div>
  );
};

export default Features;
