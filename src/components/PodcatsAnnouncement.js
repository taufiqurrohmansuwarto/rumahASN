import {
  createStyles,
  Card,
  Image,
  Avatar,
  Text,
  Group,
  Button,
} from "@mantine/core";
import { IconMicrophone } from "@tabler/icons";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  title: {
    fontWeight: 700,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    lineHeight: 1.2,
  },

  body: {
    padding: theme.spacing.md,
  },
}));

const ArticleCardVertical = ({ image, category, title }) => {
  const router = useRouter();
  const { classes } = useStyles();

  const gotoPodcast = () => router.push("/edukasi/podcasts");

  return (
    <Card withBorder radius="md" p={0} className={classes.card}>
      <Group noWrap spacing={0}>
        <Image alt="tets" src={image} height={140} width={140} />
        <div className={classes.body}>
          <Text transform="uppercase" color="dimmed" weight={700} size="xs">
            {category}
          </Text>
          <Text className={classes.title} mt="xs" mb="md">
            {title}
          </Text>
          <Group noWrap spacing="xs">
            <Group spacing="xs" noWrap>
              <Button
                onClick={gotoPodcast}
                leftIcon={<IconMicrophone size={15} />}
                color="lime"
              >
                Dengarkan Podcast!
              </Button>
            </Group>
          </Group>
        </div>
      </Group>
    </Card>
  );
};

export default ArticleCardVertical;
