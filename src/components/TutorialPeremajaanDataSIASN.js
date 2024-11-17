import { Alert } from "@mantine/core";
import { IconClockCancel, IconUxCircle } from "@tabler/icons";
import Typography from "antd/lib/typography/Typography";
import Link from "next/link";
import React from "react";

function TutorialPeremajaanDataSIASN() {
  return (
    <Alert
      color="red"
      title="Tutorial Peremajaan Data SIASN"
      icon={<IconClockCancel />}
    >
      <Typography.Text>
        Halo sobat ASN sebelum bertanya tentang peremajaan data SIASN, yuk baca
        dulu di tutorial peremajaan data SIASN{" "}
        <Link href="/layanan/pemutakhiran-data-siasn">disini</Link>
      </Typography.Text>
    </Alert>
  );
}

export default TutorialPeremajaanDataSIASN;
