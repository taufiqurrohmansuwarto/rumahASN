import CompareSKP22ByNip from "@/components/PemutakhiranData/Admin/CompareSKP22ByNip";
import { Anchor, Col, Row } from "antd";
import ComparePenghargaanByNip from "../../ComparePenghargaanByNip";
import CompareHukdisByNip from "../CompareHukdisByNip";
import CompareKinerjaPeriodikNip from "../CompareKinerjaPeriodikNip";

function ContentPrestasiDanDisiplin({ nip }) {
  return (
    <Row>
      <Col md={20}>
        <Row gutter={[16, 16]}>
          <Col md={24}>
            <CompareSKP22ByNip nip={nip} />
          </Col>
          <Col md={24}>
            <CompareKinerjaPeriodikNip nip={nip} />
          </Col>
          <Col md={24}>
            <ComparePenghargaanByNip nip={nip} />
          </Col>
          <Col md={24}>
            <CompareHukdisByNip nip={nip} />
          </Col>
        </Row>
      </Col>
      <Col md={4}>
        <Anchor
          offsetTop={70}
          items={[
            {
              key: "kinerja",
              href: "#kinerja",
              title: "Kinerja",
              children: [
                {
                  key: "kinerja-siasn",
                  href: "#kinerja-siasn",
                  title: "SIASN",
                },
                {
                  key: "kinerja-master",
                  href: "#kinerja-master",
                  title: "SIMASTER",
                },
              ],
            },
            {
              key: "kinerja-periodik",
              href: "#kinerja-periodik",
              title: "Kinerja Periodik",
            },
            {
              key: "penghargaan",
              href: "#penghargaan",
              title: "Penghargaan",
              children: [
                {
                  key: "penghargaan-master",
                  href: "#penghargaan-master",
                  title: "SIMASTER",
                },
                {
                  key: "penghargaan-siasn",
                  href: "#penghargaan-siasn",
                  title: "SIASN",
                },
              ],
            },
            {
              key: "disiplin",
              href: "#disiplin",
              title: "Disiplin",
              children: [
                {
                  key: "disiplin-master",
                  href: "#disiplin-master",
                  title: "SIMASTER",
                },
                {
                  key: "disiplin-siasn",
                  href: "#disiplin-siasn",
                  title: "SIASN",
                },
              ],
            },
          ]}
        />
      </Col>
    </Row>
  );
}

export default ContentPrestasiDanDisiplin;
