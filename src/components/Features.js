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
      "Fitur Forum Kepegawaian Rumah ASN memungkinkan pengguna berdiskusi langsung dengan pejabat BKD tentang kepegawaian.",
  },
  {
    icon: IconStar,
    title: "Penilaian Layanan",
    description:
      "Fitur Penilaian Layanan memungkinkan pengguna memberikan feedback untuk meningkatkan layanan BKD Provinsi Jawa Timur.",
  },
  {
    icon: IconMicrophone,
    title: "Podcast",
    description:
      "Fitur Podcast Rumah ASN menyajikan topik menarik seputar kepegawaian dari pejabat dan staf BKD secara informatif dan menyenangkan.",
  },
  {
    icon: IconDatabaseImport,
    title: "Integrasi Sistem SIASN",
    description:
      "Fitur Integrasi Sistem memudahkan pengguna melacak layanan kepegawaian seperti pensiun, perbaikan nama/NIP, dan kenaikan pangkat.",
  },
  {
    icon: IconUserPlus,
    title: "Single Sign-On",
    description:
      "Fitur Single Sign-On mempermudah akses Rumah ASN dengan akun Gmail untuk masyarakat umum atau SSO Kepegawaian bagi pegawai Pemprov Jawa Timur.",
  },
  {
    icon: IconCertificate,
    title: "Webinar Series",
    description:
      "Fitur Webinar Rumah ASN menyajikan edukasi terstruktur dengan sertifikat TTE yang valid, memberikan kemudahan dan kepercayaan bagi peserta.",
  },
  {
    icon: IconBrandZoom,
    title: "Coaching & Mentoring",
    description:
      "Pelatihan virtual kepegawaian daerah di platform digital menghadirkan diskusi mendalam dengan ahli BKD untuk memudahkan informasi dan meningkatkan pelayanan.",
  },
  {
    icon: IconBrand4chan,
    title: "ASN Updates",
    description:
      "Fitur ini seperti Facebook atau Twitter, tapi khusus untuk ASN. Update status informatif, bagikan pengalaman, atau info yang bisa memotivasi rekan ASN. Tetap profesional, ya!",
  },
  {
    icon: IconBrandAirbnb,
    title: "ASN Discussions",
    description:
      "Siap diskusi seru dan fokus? Fitur ini menghadirkan tema menarik dari BKD, seperti strategi kerja hingga perkembangan di sektor pemerintahan, untuk diskusi konstruktif dan ide-ide cemerlang.",
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
