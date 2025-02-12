import { Center, Image, Loader, Stack } from "@mantine/core";

function Loading() {
  return (
    <Center style={{ width: "100%", height: "100vh" }}>
      <Stack align="center" spacing="xs">
        <div style={{ width: 100 }}>
          <Image
            src="https://siasn.bkd.jatimprov.go.id:9000/public/logobkd.jpg"
            alt="logo bkd"
          />
        </div>
        <Loader size="md" />
      </Stack>
    </Center>
  );
}

export default Loading;
