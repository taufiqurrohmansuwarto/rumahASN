import { Col, Row, Space, Typography, Grid } from "antd";
import React from "react";

const { useBreakpoint } = Grid;

const styles = {
  footer: {
    backgroundColor: "#1f1f1f",
    color: "white",
    padding: 80,
  },
  textFont: {
    color: "white",
  },
  text: {
    color: "white",
    fontSize: 14,
  },
};

function Footer() {
  const screens = useBreakpoint();
  return (
    <div style={styles.footer}>
      <Row
        style={{
          paddingLeft: screens.xs ? 0 : 200,
          paddingRight: screens.xs ? 0 : 200,
        }}
      >
        <Col md={6} xs={12}>
          <Typography.Title level={7} style={styles.textFont}>
            Aplikasi
          </Typography.Title>
          <Space direction="vertical">
            <Typography.Link style={styles.text}>
              SIMASTER Fasilitator
            </Typography.Link>
            <Typography.Link style={styles.text}>
              SIMASTER Personal
            </Typography.Link>
            <Typography.Link style={styles.text}>
              PTTPK Personal
            </Typography.Link>
            <Typography.Link style={styles.text}>
              PTTPK Fasilitator
            </Typography.Link>
          </Space>
        </Col>
        <Col md={6} xs={12}>
          <Typography.Title level={7} style={styles.textFont}>
            Aplikasi
          </Typography.Title>
          <Space direction="vertical">
            <Typography.Link style={styles.text}>
              SIMASTER Fasilitator
            </Typography.Link>
            <Typography.Link style={styles.text}>
              SIMASTER Personal
            </Typography.Link>
            <Typography.Link style={styles.text}>
              PTTPK Personal
            </Typography.Link>
            <Typography.Link style={styles.text}>
              PTTPK Fasilitator
            </Typography.Link>
          </Space>
        </Col>
      </Row>
    </div>
  );
}

export default Footer;
