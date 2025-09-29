import React, { memo } from "react";
import { Radio, Flex } from "antd";
import { UserOutlined, TeamOutlined } from "@ant-design/icons";
import { Text as MantineText } from "@mantine/core";

function SignatureTypeSelection({ signatureType, onChange }) {
  return (
    <div>
      <MantineText style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 6, display: "block" }}>
        Pilih Jenis Tanda Tangan
      </MantineText>
      <div style={{ padding: "16px", background: "#f0f5ff", borderRadius: "8px", border: "1px solid #adc6ff" }}>
        <Radio.Group
          value={signatureType}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: "100%" }}
        >
          <Flex vertical gap="middle">
            <Radio value="self_sign">
              <Flex vertical style={{ marginLeft: 8 }}>
                <Flex align="center" gap="small" style={{ fontWeight: 600, color: "#6b7280" }}>
                  <UserOutlined style={{ color: "#FF4500" }} /> Tanda Tangan Mandiri
                </Flex>
                <MantineText style={{ fontSize: 12, color: "#9ca3af" }}>
                  Saya akan menandatangani dokumen ini sendiri
                </MantineText>
              </Flex>
            </Radio>

            <Radio value="request_sign">
              <Flex vertical style={{ marginLeft: 8 }}>
                <Flex align="center" gap="small" style={{ fontWeight: 600, color: "#6b7280" }}>
                  <TeamOutlined style={{ color: "#FF4500" }} /> Pengajuan (Sequential)
                </Flex>
                <MantineText style={{ fontSize: 12, color: "#9ca3af" }}>
                  Melibatkan penandatangan lain secara berurutan
                </MantineText>
              </Flex>
            </Radio>
          </Flex>
        </Radio.Group>
      </div>
    </div>
  );
}

export default memo(SignatureTypeSelection);