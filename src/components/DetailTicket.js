import { CloseButton, Group, Paper, Text } from "@mantine/core";

export function DetailTicket({ data }) {
  return (
    <Paper withBorder p="lg" radius="md" shadow="md">
      <Group position="apart" mb="xs">
        <Text size="lg" weight={500}>
          {data?.title}
        </Text>
        <CloseButton mr={-9} mt={-9} />
      </Group>
      <Text color="dimmed" size="md">
        <div dangerouslySetInnerHTML={{ __html: data?.content }} />
      </Text>
    </Paper>
  );
}
