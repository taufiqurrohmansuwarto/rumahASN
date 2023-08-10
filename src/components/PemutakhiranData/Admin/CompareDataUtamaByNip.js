import { dataUtamaMasterByNip } from "@/services/master.services";
import { dataUtamSIASNByNip } from "@/services/siasn-services";
import { komparasiGelar } from "@/utils/client-utils";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Stack, Table } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Col, Row, Skeleton, Typography } from "antd";
import CheckHasil from "../CheckHasil";
import { IconAlertCircle, IconCircleCheck } from "@tabler/icons";

const Pemberitahuan = () => {
  return (
    <Alert
      showIcon
      banner
      type="info"
      description={
        <>
          <Typography.Text>
            Cek segera Data Nama, NIP, dan Tanggal Lahirmu. Apabila ada yang
            berbeda silahkan lapor menggunakan tombol Tanya BKD diatas.
            Penulisan gelar seperti S.Kom dengan S.Kom. dianggap sama tidak
            perlu perbaikan #datamutanggungjawabmu
          </Typography.Text>
        </>
      }
    />
  );
};

function CompareDataUtamaByNip({ nip }) {
  const { data, isLoading } = useQuery(["data-utama-siasn", nip], () =>
    dataUtamSIASNByNip(nip)
  );

  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery(
    ["data-utama-simaster", nip],
    () => dataUtamaMasterByNip(nip)
  );

  return (
    <div>
      <Stack>
        <Pemberitahuan />
        <Skeleton loading={isLoading || isLoadingDataSimaster}>
          <Row
            gutter={[
              { xs: 8, sm: 16, md: 24, lg: 32 },
              { xs: 8, sm: 16, md: 24, lg: 32 },
            ]}
          >
            <Col md={18}>
              <Card>
                <Table>
                  <thead>
                    <tr>
                      <th>Jenis Data</th>
                      <th>SIASN</th>
                      <th>SIMASTER</th>
                      <th
                        style={{
                          textAlign: "center",
                        }}
                      >
                        Hasil
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Nama</td>
                      <td>{data?.nama}</td>
                      <td>{dataSimaster?.nama}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <CheckHasil
                          firstData={data?.nama}
                          secondData={dataSimaster?.nama}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>NIP</td>
                      <td>{data?.nipBaru}</td>
                      <td>{dataSimaster?.nip_baru}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <CheckHasil
                          firstData={data?.nipBaru}
                          secondData={dataSimaster?.nip_baru}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Tanggal Lahir</td>
                      <td>{data?.tglLahir}</td>
                      <td>{dataSimaster?.tgl_lahir}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <CheckHasil
                          firstData={data?.tglLahir}
                          secondData={dataSimaster?.tgl_lahir}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Gelar Depan</td>
                      <td>{data?.gelarDepan}</td>
                      <td>{dataSimaster?.gelar_depan}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        {komparasiGelar(
                          data?.gelarDepan,
                          dataSimaster?.gelar_depan
                        ) ? (
                          <IconCircleCheck />
                        ) : (
                          <CloseOutlined />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Gelar Belakang</td>
                      <td>{data?.gelarBelakang}</td>
                      <td>{dataSimaster?.gelar_belakang}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        {komparasiGelar(
                          data?.gelarBelakang,
                          dataSimaster?.gelar_belakang
                        ) ? (
                          <IconCircleCheck />
                        ) : (
                          <CloseOutlined />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Email</td>
                      <td>{data?.email}</td>
                      <td>{dataSimaster?.email}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <CheckHasil
                          firstData={data?.email}
                          secondData={dataSimaster?.email}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Jabatan</td>
                      <td>{data?.jabatanNama}</td>
                      <td>{dataSimaster?.jabatan?.jabatan}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <IconAlertCircle
                          style={{
                            color: "orange",
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Pendidikan Terakhir</td>
                      <td>{data?.pendidikanTerakhirNama}</td>
                      <td>{`${dataSimaster?.pendidikan?.jenjang} ${dataSimaster?.pendidikan?.prodi}`}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <IconAlertCircle
                          style={{
                            color: "orange",
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Pangkat</td>
                      <td>{`${data?.golRuangAkhir}-${data?.pangkatAkhir}`}</td>
                      <td>{`${dataSimaster?.pangkat?.golongan}-${dataSimaster?.pangkat?.pangkat}`}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <IconAlertCircle
                          style={{
                            color: "orange",
                          }}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>NIK</td>
                      <td>{data?.nik}</td>
                      <td>{dataSimaster?.nik}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <IconAlertCircle
                          style={{
                            color: "orange",
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
        </Skeleton>
      </Stack>
    </div>
  );
}

export default CompareDataUtamaByNip;
