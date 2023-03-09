import {
  CloseButton,
  Group,
  Paper,
  Rating,
  Stack,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";

const SubKategoriPriorities = ({ data }) => {
  if (data?.sub_category_id && data?.priority_code) {
    return (
      <Group noWrap>
        <Text size="xs">Prioritas : {data?.priority_code}</Text>
        <Text size="xs">Sub Kategory : {data?.sub_category?.name} </Text>
        {data?.status_code === "SELESAI" && data?.assignee_reason ? (
          <Text size="xs">Solusi : {data?.assignee_reason}</Text>
        ) : null}
        {data?.status_code === "SELESAI" && data?.stars ? (
          <Text size="xs">
            Rating : <Rating value={data?.stars} />
          </Text>
        ) : null}
        {data?.status_code === "SELESAI" && data?.requester_comment ? (
          <Text size="xs">Feedback : {data?.requester_comment}</Text>
        ) : null}
      </Group>
    );
  }

  if (data?.status_code === "SELESAI" && data?.assignee_reason) {
    return (
      <Stack>
        <Text size="lg" weight={500}>
          Solusi : {data?.assignee_reason}
        </Text>
      </Stack>
    );
  }
};

export function DetailTicket({ data }) {
  return (
    <Paper p="lg" radius="md">
      <Group position="apart" mb="xs">
        <Title order={2}>{data?.title}</Title>
      </Group>
      <TypographyStylesProvider>
        <div dangerouslySetInnerHTML={{ __html: data?.content }} />
      </TypographyStylesProvider>
      <SubKategoriPriorities data={data} />
    </Paper>
  );
}
