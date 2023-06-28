import { landingData } from "@/services/index";
import {
  Avatar,
  Badge,
  Card,
  Container,
  Group,
  Rating,
  SimpleGrid,
  Stack,
  Text,
  Title,
  createStyles,
  rem,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { uniqBy } from "lodash";

const blacklist = [
  "105503740477298041174",
  "master|88",
  "master|56552",
  "master|56543",
  "113359564305461720000",
];

const whiteListData = (data) => {
  // take 6 items from data and requester_comment min 10 chars and unique requester
  //   return data
  //     ?.filter(
  //       (item) =>
  //         !blacklist.includes(item.customer?.custom_id) &&
  //         item.requester_comment.length > 15
  //     )
  //     .slice(0, 6);

  const hasil = uniqBy(data, "requester");

  return hasil
    ?.filter(
      (item) =>
        !blacklist.includes(item.customer?.custom_id) &&
        item.requester_comment.length > 15
    )
    .slice(0, 6);
};

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: rem(34),
    fontWeight: 900,

    [theme.fn.smallerThan("sm")]: {
      fontSize: rem(24),
    },
  },

  description: {
    maxWidth: 600,
    margin: "auto",

    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },

  card: {
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  cardTitle: {
    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
    },
  },
}));

export default function UserRating() {
  const { data, isLoading } = useQuery(["landing"], () => landingData(), {
    refetchOnWindowFocus: false,
  });

  const { classes, theme } = useStyles();
  //   const features = whiteListData(data?.ticketWithRatings).map((feature) => (
  //     <Card
  //       key={feature.title}
  //       shadow="md"
  //       radius="md"
  //       className={classes.card}
  //       padding="xl"
  //     >
  //       <feature.icon size={rem(50)} stroke={2} color={theme.fn.primaryColor()} />
  //       <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
  //         {feature.title}
  //       </Text>
  //       <Text fz="sm" c="dimmed" mt="sm">
  //         {feature.description}
  //       </Text>
  //     </Card>
  //   ));

  return (
    <Container size="lg" py="xl">
      <Group position="center">
        <Badge variant="filled" size="lg">
          Testimoni Rumah ASN
        </Badge>
      </Group>

      <Title order={2} className={classes.title} ta="center" mt="sm">
        Testi Mantul Rumah ASN: Asli dari Pengguna, No Debat!
      </Title>

      <Text c="dimmed" className={classes.description} ta="center" mt="md">
        Mau tau gimana pengalaman teman-teman lain pas pakai Rumah ASN? Cus cek
        Testi Mantul kita! Di sini, kamu bisa lihat dan baca testimoni asli dari
        pengguna. Jangan cuma denger, cobain sendiri!
      </Text>

      <SimpleGrid
        cols={3}
        spacing="xl"
        mt={50}
        breakpoints={[{ maxWidth: "md", cols: 1 }]}
      >
        {data && (
          <>
            {whiteListData(data?.ticketsWithRatings)?.map((item) => (
              <Card
                key={item?.id}
                shadow="md"
                radius="md"
                className={classes.card}
                padding="xl"
              >
                <Stack>
                  <Avatar src={item?.customer?.image} radius={100} />
                  <Rating value={5} />
                </Stack>
                <Text fz="sm" fw={500} className={classes.cardTitle} mt="md">
                  {item?.customer?.username}
                </Text>
                <Text fz="sm" c="dimmed" mt="sm">
                  {item?.requester_comment}
                </Text>
              </Card>
            ))}
          </>
        )}
      </SimpleGrid>
    </Container>
  );
}
