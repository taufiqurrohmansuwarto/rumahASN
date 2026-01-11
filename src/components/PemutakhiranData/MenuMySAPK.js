import IPAsn from "@/components/LayananSIASN/IPAsn";
import CekPencantumanGelar from "@/components/PemutakhiranData/Button/CekPencantumanGelar";
import CekPencantumanGelarProfesi from "@/components/PemutakhiranData/Button/CekPencantumanGelarProfesi";
import CheckFotoPersonal from "@/components/PemutakhiranData/OCR/CheckFotoPersonal";
import { updateFotoSiasn } from "@/services/siasn-services";
import { mysapkMenu } from "@/utils/client-utils";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ReloadOutlined,
  SettingOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Grid,
  message,
  Row,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
  Space,
} from "antd";
import { useRouter } from "next/router";
import GantiEmail from "../LayananSIASN/GantiEmail";
import PengaturanGelar from "../LayananSIASN/PengaturanGelar";
import ProfilDMSPersonal from "./ProfilDMSPersonal";

const { Title, Text } = Typography;

const mockdata = mysapkMenu;

const LoadingSkeleton = ({ minHeight = "120px" }) => (
  <Card
    style={{
      width: "100%",
      backgroundColor: "#FFFFFF",
      border: "1px solid #EDEFF1",
      borderRadius: "4px",
      marginBottom: "8px",
    }}
    bodyStyle={{ padding: 0 }}
  >
    <Flex>
      <div
        style={{
          width: "40px",
          backgroundColor: "#F8F9FA",
          borderRight: "1px solid #EDEFF1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight,
        }}
      >
        <Skeleton.Avatar size={16} />
      </div>
      <Flex vertical style={{ flex: 1, padding: "12px" }} gap={8}>
        <Skeleton.Input style={{ width: "40%" }} active size="small" />
        <Skeleton
          paragraph={{ rows: 2, width: ["100%", "80%"] }}
          active
          title={false}
        />
      </Flex>
    </Flex>
  </Card>
);

const MenuButton = ({ item, onClick, isMobile }) => (
  <Card
    hoverable
    style={{
      height: isMobile ? "85px" : "100px",
      backgroundColor: "#FFFFFF",
      border: "1px solid #EDEFF1",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    }}
    bodyStyle={{
      padding: isMobile ? "10px" : "14px",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
    }}
    onClick={() => onClick(item?.path)}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "#898989";
      e.currentTarget.style.transform = "scale(1.02)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "#EDEFF1";
      e.currentTarget.style.transform = "scale(1)";
    }}
  >
    <item.icon
      style={{
        color: "#FF4500",
        fontSize: isMobile ? "22px" : "28px",
        marginBottom: isMobile ? "6px" : "10px",
      }}
    />
    <Text
      style={{
        fontSize: isMobile ? "11px" : "13px",
        fontWeight: 500,
        color: "#1A1A1B",
        margin: 0,
        lineHeight: isMobile ? "1.2" : "1.3",
        textAlign: "center",
      }}
    >
      {item.title}
    </Text>
  </Card>
);

export function MenuMySAPK({
  dataUtama,
  foto,
  simaster,
  loadingDataUtamaSiasn,
  loadingDataUtamaMaster,
  loadingFoto,
  refetchDataUtamaSiasn,
  refetchDataUtamaMaster,
  dataIPAsn,
  isLoadingDataIPAsn,
  isFetchingDataIPAsn,
  refetchDataIPAsn,
}) {
  const router = useRouter();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const handleClick = (currentPath) => {
    const path = `/pemutakhiran-data${currentPath}`;
    router.push(path);
  };

  const handleRefresh = () => {
    refetchDataUtamaSiasn();
    refetchDataUtamaMaster();
    refetchDataIPAsn();
  };

  const isFetchingAny =
    loadingDataUtamaSiasn || loadingDataUtamaMaster || isFetchingDataIPAsn;

  // Responsive variables using Antd breakpoints
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const avatarSize = isMobile ? 65 : 85;
  const mainPadding = isMobile ? "12px" : "16px";
  const titleFontSize = isMobile ? "16px" : "18px";
  const iconSectionWidth = isMobile ? "0px" : "40px";

  const queryClient = useQueryClient();

  const { mutate: transferFoto, isLoading: isTransferFotoLoading } =
    useMutation({
      mutationFn: updateFotoSiasn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["foto-pns"] });
        message.success("Foto berhasil ditransfer");
      },
      onError: () => {
        message.error("Gagal menyalin foto");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["foto-pns"] });
      },
    });

  const handleTransferFoto = () => {
    transferFoto();
  };

  return (
    <div>
      {/* Header Profile */}
      <Card
        style={{
          width: "100%",
          marginBottom: "16px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex>
          {/* Icon Section - Hide on mobile */}
          {!isMobile && (
            <div
              style={{
                width: iconSectionWidth,
                backgroundColor: "#F8F9FA",
                borderRight: "1px solid #EDEFF1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "220px",
              }}
            >
              <UserOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1, padding: mainPadding }}>
            <Flex
              justify="space-between"
              align={isMobile ? "flex-start" : "center"}
              vertical={isMobile}
              style={{ marginBottom: isMobile ? "16px" : "20px" }}
            >
              <div style={{ marginBottom: isMobile ? "12px" : 0 }}>
                <Title
                  level={isMobile ? 5 : 4}
                  style={{
                    margin: 0,
                    color: "#1A1A1B",
                    lineHeight: isMobile ? "1.3" : "1.4",
                  }}
                >
                  👤 Profil Pegawai
                </Title>
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: isMobile ? "12px" : "14px",
                    lineHeight: isMobile ? "1.3" : "1.4",
                  }}
                >
                  Informasi data pribadi dan layanan MyASN
                </Text>
              </div>
              <Tooltip title="Refresh">
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  loading={isFetchingAny}
                  onClick={handleRefresh}
                  size={isMobile ? "small" : "middle"}
                  style={{
                    color: "#787C7E",
                    border: "1px solid #EDEFF1",
                    borderRadius: "4px",
                  }}
                >
                  {isFetchingAny ? "Memuat..." : "Refresh Data"}
                </Button>
              </Tooltip>
            </Flex>

            <Flex
              gap={isMobile ? 12 : 20}
              align="flex-start"
              vertical={isMobile}
              style={{ marginBottom: isMobile ? "16px" : "20px" }}
            >
              {/* Photos Section */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isMobile ? "flex-start" : "center",
                  gap: "12px",
                  width: isMobile ? "100%" : "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: isMobile ? "12px" : "16px",
                    padding: isMobile ? "12px" : "16px",
                    backgroundColor: "#F8F9FA",
                    borderRadius: "12px",
                    border: "1px solid #EDEFF1",
                    width: isMobile ? "100%" : "auto",
                    justifyContent: isMobile ? "center" : "flex-start",
                    alignItems: "center",
                  }}
                >
                  <div style={{ textAlign: "center", position: "relative" }}>
                    <Tooltip title="Foto SIMASTER - Status: Online">
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                        }}
                      >
                        {loadingDataUtamaMaster ? (
                          <Skeleton.Avatar
                            size={avatarSize}
                            active
                            style={{
                              border: `${
                                isMobile ? "3px" : "4px"
                              } solid #FF4500`,
                            }}
                          />
                        ) : (
                          <>
                        <Avatar
                          size={avatarSize}
                          src={simaster?.foto}
                          alt="Foto-SIMASTER"
                          style={{
                                border: `${
                                  isMobile ? "3px" : "4px"
                                } solid #FF4500`,
                            boxShadow: "0 4px 12px rgba(255, 69, 0, 0.2)",
                          }}
                        />
                        {/* Online Indicator */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "3px",
                            right: "3px",
                            width: isMobile ? "16px" : "20px",
                            height: isMobile ? "16px" : "20px",
                            backgroundColor: "#52C41A",
                            border: "3px solid #FFFFFF",
                            borderRadius: "50%",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          }}
                        />
                          </>
                        )}
                      </div>
                    </Tooltip>
                    <Text
                      style={{
                        fontSize: isMobile ? "11px" : "12px",
                        color: "#787C7E",
                        marginTop: "6px",
                        display: "block",
                        lineHeight: "1.2",
                        fontWeight: 500,
                      }}
                    >
                      SIMASTER
                    </Text>
                  </div>

                  <div style={{ textAlign: "center", position: "relative" }}>
                    <Tooltip title="Foto SIASN - Status: Online">
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                        }}
                      >
                        {loadingFoto ? (
                          <Skeleton.Avatar
                            size={avatarSize}
                            active
                            style={{
                              border: `${
                                isMobile ? "3px" : "4px"
                              } solid #1890FF`,
                            }}
                          />
                        ) : (
                          <>
                        <Avatar
                          size={avatarSize}
                          src={foto?.data}
                          alt="Foto-SIASN"
                          style={{
                                border: `${
                                  isMobile ? "3px" : "4px"
                                } solid #1890FF`,
                            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.2)",
                          }}
                        />
                        {/* Online Indicator */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "3px",
                            right: "3px",
                            width: isMobile ? "16px" : "20px",
                            height: isMobile ? "16px" : "20px",
                            backgroundColor: "#52C41A",
                            border: "3px solid #FFFFFF",
                            borderRadius: "50%",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          }}
                        />
                          </>
                        )}
                      </div>
                    </Tooltip>
                    <Text
                      style={{
                        fontSize: isMobile ? "11px" : "12px",
                        color: "#787C7E",
                        marginTop: "6px",
                        display: "block",
                        lineHeight: "1.2",
                        fontWeight: 500,
                      }}
                    >
                      SIASN
                    </Text>
                  </div>
                </div>

                {/* Transfer Photo Button */}
                <Space>
                  <Button
                    type="default"
                    size={isMobile ? "small" : "middle"}
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #FF4500",
                      color: "#FF4500",
                      borderRadius: "6px",
                      fontWeight: 500,
                      width: isMobile ? "100%" : "auto",
                      minWidth: "140px",
                    }}
                    loading={isTransferFotoLoading}
                    onClick={handleTransferFoto}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#FF4500";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                      e.currentTarget.style.color = "#FF4500";
                    }}
                  >
                    🔄 Transfer Foto
                  </Button>
                  <CheckFotoPersonal />
                </Space>
              </div>

              {/* Profile Info */}
              <Flex vertical style={{ flex: 1, minWidth: 0 }}>
                <Flex
                  align="center"
                  gap={8}
                  wrap="wrap"
                  style={{ marginBottom: "6px" }}
                >
                  <Text
                    strong
                    style={{
                      fontSize: titleFontSize,
                      color: "#1A1A1B",
                      wordBreak: "break-word",
                      lineHeight: isMobile ? "1.3" : "1.4",
                    }}
                  >
                    {dataUtama?.nama}
                  </Text>
                  <ProfilDMSPersonal />
                </Flex>
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: isMobile ? "12px" : "14px",
                    marginBottom: "6px",
                    lineHeight: isMobile ? "1.3" : "1.4",
                  }}
                >
                  NIP: {dataUtama?.nipBaru}
                </Text>
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: isMobile ? "12px" : "14px",
                    marginBottom: "6px",
                    wordBreak: "break-word",
                    lineHeight: isMobile ? "1.3" : "1.4",
                  }}
                >
                  {dataUtama?.jabatanNama}
                </Text>
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: isMobile ? "11px" : "13px",
                    marginBottom: "12px",
                    lineHeight: isMobile ? "1.3" : "1.4",
                    wordBreak: "break-word",
                  }}
                >
                  {dataUtama?.unorIndukNama} - {dataUtama?.unorNama}
                </Text>

                {/* Tags */}
                <Flex gap={8} wrap="wrap" style={{ marginBottom: "12px" }}>
                  <Tooltip title="Kedudukan PNS">
                    <Tag
                      icon={<TagOutlined />}
                      color="yellow"
                      style={{
                        borderRadius: "4px",
                        fontSize: isMobile ? "10px" : "12px",
                      }}
                    >
                      {dataUtama?.kedudukanPnsNama}
                    </Tag>
                  </Tooltip>
                  <Tooltip title="Status Verifikasi NIK dengan NIP">
                    <Tag
                      icon={
                        dataUtama?.validNik ? (
                          <CheckCircleFilled />
                        ) : (
                          <CloseCircleFilled />
                        )
                      }
                      color={dataUtama?.validNik ? "green" : "red"}
                      style={{
                        borderRadius: "4px",
                        fontSize: isMobile ? "10px" : "12px",
                      }}
                    >
                      {dataUtama?.validNik
                        ? "NIK Terverifikasi"
                        : "NIK Belum Terverifikasi"}
                    </Tag>
                  </Tooltip>
                </Flex>
              </Flex>
            </Flex>

            {/* Quick Actions */}
            <div
              style={{
                padding: isMobile ? "8px" : "12px",
                backgroundColor: "#F8F9FA",
                borderRadius: "6px",
                border: "1px solid #EDEFF1",
              }}
            >
              <Text
                style={{
                  fontSize: isMobile ? "11px" : "12px",
                  color: "#787C7E",
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: 500,
                  lineHeight: isMobile ? "1.3" : "1.4",
                }}
              >
                Aksi Cepat:
              </Text>
              <Flex
                gap={6}
                wrap="wrap"
                justify={isMobile ? "center" : "flex-start"}
              >
                <IPAsn
                  tahun={2024}
                  dataIPAsn={dataIPAsn}
                  isLoadingDataIPAsn={isLoadingDataIPAsn}
                  isFetchingDataIPAsn={isFetchingDataIPAsn}
                  refetchDataIPAsn={refetchDataIPAsn}
                />
                <CekPencantumanGelar />
                <CekPencantumanGelarProfesi />
                <PengaturanGelar />
                <GantiEmail />
              </Flex>
            </div>
          </div>
        </Flex>
      </Card>

      {/* Menu Grid */}
      <Card
        style={{
          width: "100%",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex>
          {/* Icon Section - Hide on mobile */}
          {!isMobile && (
            <div
              style={{
                width: iconSectionWidth,
                backgroundColor: "#F8F9FA",
                borderRight: "1px solid #EDEFF1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "280px",
              }}
            >
              <SettingOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1, padding: mainPadding }}>
            <Title
              level={5}
              style={{
                marginBottom: "16px",
                color: "#1A1A1B",
                fontSize: isMobile ? "14px" : "16px",
                lineHeight: isMobile ? "1.3" : "1.4",
              }}
            >
              ⚙️ Menu Layanan MyASN
            </Title>

            <Row gutter={[6, 6]}>
              {mockdata.map((item) => (
                <Col
                  key={item.title}
                  xs={12}
                  sm={8}
                  md={6}
                  lg={4}
                  xl={4}
                  xxl={4}
                >
                  <MenuButton
                    item={item}
                    onClick={handleClick}
                    isMobile={isMobile}
                  />
                </Col>
              ))}
            </Row>
          </div>
        </Flex>
      </Card>

      <style jsx global>{`
        .ant-card-hoverable:hover {
          border-color: #898989 !important;
        }
      `}</style>
    </div>
  );
}
