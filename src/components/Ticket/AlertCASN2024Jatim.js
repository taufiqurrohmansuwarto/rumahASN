import { Alert, Stack, Image } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons";

function AlertCASN2024Jatim() {
  return (
    <Stack>
      {/* <Alert
        color="yellow"
        mb="md"
        title="Pengumuman CASN 2024 Jatim"
        variant="outline"
        icon={<IconInfoCircle />}
      >
        <p>
          Untuk informasi lebih lanjut mengenai CASN 2024 Jatim, silakan
          kunjungi{" "}
          <a
            href="https://bkd.jatimprov.go.id/Rekrutmen-ASN2024/bacpeng/pengumuman-rekrutmen-cpns-pemprov-jatim-tahun-2024"
            target="_blank"
            rel="noreferrer"
          >
            Pengumuman Rekrutmen ASN Pemprov Jatim Tahun 2024
          </a>
        </p>
      </Alert> */}
      <a href="https://sscasn.bkn.go.id/" target={"_blank"} rel={"noreferrer"}>
        <Image
          mb={10}
          src={
            "https://siasn.bkd.jatimprov.go.id:9000/public/banner-sscasn.png"
          }
          alt="banner-sscasn.webp"
        />
      </a>
    </Stack>
  );
}

export default AlertCASN2024Jatim;
