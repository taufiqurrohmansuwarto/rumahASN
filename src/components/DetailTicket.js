import {
  CloseButton,
  Group,
  Paper,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";

export function DetailTicket({ data }) {
  return (
    <Paper withBorder p="lg" radius="md" shadow="md">
      <Group position="apart" mb="xs">
        <Title order={2}>{data?.title}</Title>
        <CloseButton mr={-9} mt={-9} />
      </Group>
      <TypographyStylesProvider>
        <div dangerouslySetInnerHTML={{ __html: data?.content }} />
      </TypographyStylesProvider>
    </Paper>
  );
}
