import {
  Avatar,
  Box,
  Button,
  Group,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconMessage,
  IconShare,
} from "@tabler/icons";
import { Space } from "antd";

const RedditCard = () => {
  const theme = useMantineTheme();

  const postData = {
    subreddit: "AskReddit",
    username: "u/AmelioClarkson",
    title:
      "What’s up with YouTube removing the dislike button? What is your opinion?",
    body: "I realise that the main intention was to stop trolls from mass disliking and to promote a sense of positivity, but without the dislike count, it becomes nearly impossible to know which video is actually good and which ones are spam. The dislike count is especially useful for educational and cooking videos.",
    upvotes: "2.5k",
    comments: "530 comments",
    shares: "45 shares",
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Group position="apart" sx={{ marginBottom: theme.spacing.xs }}>
        <Stack spacing={0}>
          <Button variant="subtle" size="sm">
            <IconArrowUp size={18} />
          </Button>
          <Text align="center" size="sm" weight={700}>
            {postData.upvotes}
          </Text>
          <Button variant="subtle" size="sm">
            <IconArrowDown size={18} />
          </Button>
        </Stack>
        <Box sx={{ flex: 1 }}>
          <Group>
            <Avatar
              radius="xl"
              size="md"
              color="blue"
              sx={{ marginRight: theme.spacing.xs }}
            >
              R
            </Avatar>
            <div>
              <Text size="sm" weight={500}>
                {postData.subreddit}
              </Text>
              <Text size="xs" color="dimmed">
                {postData.username}
              </Text>
            </div>
          </Group>
          <Box
            sx={{
              marginTop: theme.spacing.xs,
            }}
          >
            <Text
              weight={700}
              size="lg"
              sx={{ marginBottom: theme.spacing.xs }}
            >
              {postData.title}
            </Text>
            <Text size="sm" sx={{ lineHeight: 1.5 }}>
              {postData.body}
            </Text>
          </Box>
          <Box sx={{ marginTop: theme.spacing.sm }}>
            <Group position="apart">
              <Text size="xs" color="dimmed">
                530 Comments
              </Text>
              <Text size="xs" color="dimmed">
                530 Comments
              </Text>
            </Group>
          </Box>
        </Box>
        {/* <Group>
          <Button variant="subtle" color="gray">
            <IconMessage size={18} />
            {postData.comments}
          </Button>
          <Button variant="subtle" color="gray">
            <IconShare size={18} />
            {postData.shares}
          </Button>
        </Group> */}
      </Group>
    </Box>
  );
};

export default RedditCard;
