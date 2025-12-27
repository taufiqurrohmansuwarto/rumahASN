import LayoutRasnNaskah from "@/components/RasnNaskah/LayoutRasnNaskah";
import PageContainer from "@/components/PageContainer";
import {
  useRasnNaskahPreferences,
} from "@/hooks/useRasnNaskah";
import {
  updatePreferences,
} from "@/services/rasn-naskah.services";
import {
  IconCheck,
  IconPlus,
  IconSettings,
  IconX,
  IconFile,
} from "@tabler/icons-react";
import {
  Breadcrumb,
  Button,
  Card,
  Divider,
  Input,
  message,
  Radio,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const { Text, Paragraph } = Typography;

// Editable Tag List Component
const EditableTagList = ({ items = [], onAdd, onRemove, placeholder, color = "default" }) => {
  const [inputValue, setInputValue] = useState("");
  const [inputVisible, setInputVisible] = useState(false);

  const handleAdd = () => {
    if (inputValue.trim() && !items.includes(inputValue.trim())) {
      onAdd(inputValue.trim());
      setInputValue("");
      setInputVisible(false);
    }
  };

  return (
    <div style={{
      border: "1px solid #d9d9d9",
      borderRadius: 6,
      padding: 12,
      minHeight: 60,
      background: "#fafafa"
    }}>
      <Space wrap size={[8, 8]}>
        {items.map((item, index) => (
          <Tag
            key={index}
            closable
            onClose={() => onRemove(item)}
            color={color}
            style={{
              padding: "4px 8px",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            {item}
          </Tag>
        ))}
        {inputVisible ? (
          <Input
            size="small"
            style={{ width: 150 }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleAdd}
            onPressEnter={handleAdd}
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <Tag
            onClick={() => setInputVisible(true)}
            style={{
              borderStyle: "dashed",
              cursor: "pointer",
              padding: "4px 8px",
              background: "#fff"
            }}
          >
            <IconPlus size={12} style={{ marginRight: 4 }} />
            Tambah frasa
          </Tag>
        )}
      </Space>
    </div>
  );
};

// Editable Rule List Component
const EditableRuleList = ({ items = [], onAdd, onRemove }) => {
  const [inputValue, setInputValue] = useState("");
  const [inputVisible, setInputVisible] = useState(false);

  const handleAdd = () => {
    if (inputValue.trim() && !items.includes(inputValue.trim())) {
      onAdd(inputValue.trim());
      setInputValue("");
      setInputVisible(false);
    }
  };

  return (
    <div style={{
      border: "1px solid #d9d9d9",
      borderRadius: 6,
      padding: 12,
      minHeight: 60,
      background: "#fafafa"
    }}>
      <Space direction="vertical" style={{ width: "100%" }} size={8}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 10px",
              background: "#fff",
              borderRadius: 4,
              border: "1px solid #f0f0f0"
            }}
          >
            <Text style={{ fontSize: 13 }}>{item}</Text>
            <Button
              type="text"
              size="small"
              danger
              icon={<IconX size={14} />}
              onClick={() => onRemove(item)}
            />
          </div>
        ))}
        {inputVisible ? (
          <Input
            size="small"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleAdd}
            onPressEnter={handleAdd}
            placeholder="Tulis aturan baru..."
            autoFocus
          />
        ) : (
          <Button
            type="dashed"
            size="small"
            icon={<IconPlus size={14} />}
            onClick={() => setInputVisible(true)}
            style={{ width: "100%" }}
          >
            Tambah aturan
          </Button>
        )}
      </Space>
    </div>
  );
};

const RasnNaskahPreferences = () => {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useRasnNaskahPreferences();

  // Local state for editing
  const [writingStyle, setWritingStyle] = useState("formal_ringkas");
  const [preferredPhrases, setPreferredPhrases] = useState([]);
  const [avoidedPhrases, setAvoidedPhrases] = useState([]);
  const [customRules, setCustomRules] = useState([]);

  // Sync from server
  useEffect(() => {
    if (preferences) {
      setWritingStyle(preferences.language_style || "formal_ringkas");
      setPreferredPhrases(preferences.preferred_phrases || []);
      setAvoidedPhrases(preferences.avoided_phrases || []);
      setCustomRules(preferences.custom_rules?.map(r => r.name || r) || []);
    }
  }, [preferences]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data) => {
      console.log("Saving preferences:", data);
      return updatePreferences(data);
    },
    onSuccess: (data) => {
      console.log("Save success:", data);
      message.success("Preferensi berhasil disimpan");
      queryClient.invalidateQueries(["rasn-naskah-preferences"]);
    },
    onError: (error) => {
      console.error("Save error:", error);
      console.error("Error response:", error?.response);
      const errorMessage = error?.response?.data?.message || error?.message || "Gagal menyimpan preferensi";
      message.error(errorMessage);
    },
  });

  const handleSave = () => {
    const payload = {
      language_style: writingStyle,
      preferred_phrases: preferredPhrases,
      avoided_phrases: avoidedPhrases,
      custom_rules: customRules.map(rule => ({ name: rule })),
    };
    console.log("Sending payload:", payload);
    saveMutation.mutate(payload);
  };

  // Handlers for phrase/rule management
  const addPreferredPhrase = (phrase) => {
    setPreferredPhrases([...preferredPhrases, phrase]);
  };

  const removePreferredPhrase = (phrase) => {
    setPreferredPhrases(preferredPhrases.filter(p => p !== phrase));
  };

  const addAvoidedPhrase = (phrase) => {
    setAvoidedPhrases([...avoidedPhrases, phrase]);
  };

  const removeAvoidedPhrase = (phrase) => {
    setAvoidedPhrases(avoidedPhrases.filter(p => p !== phrase));
  };

  const addCustomRule = (rule) => {
    setCustomRules([...customRules, rule]);
  };

  const removeCustomRule = (rule) => {
    setCustomRules(customRules.filter(r => r !== rule));
  };

  return (
    <>
      <Head>
        <title>SAKTI Naskah - Preferensi Saya</title>
      </Head>
      <PageContainer
        title="Preferensi Saya"
        subTitle="Atur gaya penulisan yang Anda sukai untuk review naskah"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rasn-naskah">SAKTI Naskah</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Preferensi</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <Spin spinning={isLoading}>
          <Card
            title={
              <Space>
                <IconSettings size={18} />
                <span>Preferensi Saya</span>
              </Space>
            }
          >
            {/* Writing Style */}
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ display: "block", marginBottom: 12 }}>
                Gaya Penulisan
              </Text>
              <Radio.Group
                value={writingStyle}
                onChange={(e) => setWritingStyle(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="formal_lengkap">Formal Lengkap</Radio.Button>
                <Radio.Button value="formal_ringkas">Formal Ringkas</Radio.Button>
                <Radio.Button value="semi_formal">Semi-formal</Radio.Button>
              </Radio.Group>
            </div>

            <Divider />

            {/* Preferred Phrases */}
            <div style={{ marginBottom: 24 }}>
              <Space style={{ marginBottom: 12 }}>
                <IconCheck size={16} color="#52c41a" />
                <Text strong>Frasa yang saya suka</Text>
              </Space>
              <EditableTagList
                items={preferredPhrases}
                onAdd={addPreferredPhrase}
                onRemove={removePreferredPhrase}
                placeholder="Contoh: Demikian disampaikan"
                color="green"
              />
            </div>

            <Divider />

            {/* Avoided Phrases */}
            <div style={{ marginBottom: 24 }}>
              <Space style={{ marginBottom: 12 }}>
                <IconX size={16} color="#ff4d4f" />
                <Text strong>Frasa yang saya hindari</Text>
              </Space>
              <EditableTagList
                items={avoidedPhrases}
                onAdd={addAvoidedPhrase}
                onRemove={removeAvoidedPhrase}
                placeholder="Contoh: Mohon maklum"
                color="red"
              />
            </div>

            <Divider />

            {/* Custom Rules */}
            <div style={{ marginBottom: 24 }}>
              <Space style={{ marginBottom: 12 }}>
                <IconFile size={16} color="#1890ff" />
                <Text strong>Aturan khusus</Text>
              </Space>
              <EditableRuleList
                items={customRules}
                onAdd={addCustomRule}
                onRemove={removeCustomRule}
              />
            </div>

            <Divider />

            {/* Save Button */}
            <Button
              type="primary"
              size="large"
              block
              onClick={handleSave}
              loading={saveMutation.isLoading}
            >
              Simpan Preferensi
            </Button>

            {/* Info */}
            <div
              style={{
                marginTop: 16,
                padding: 12,
                background: "#e6f7ff",
                borderRadius: 6,
                border: "1px solid #91d5ff"
              }}
            >
              <Paragraph style={{ margin: 0, fontSize: 12, color: "#1890ff" }}>
                <strong>Bagaimana ini bekerja?</strong>
                <br />
                Preferensi Anda akan disimpan dan digunakan saat orang lain membuat naskah
                dengan tujuan ke Anda. AI akan memberikan saran sesuai preferensi yang Anda atur.
              </Paragraph>
            </div>
          </Card>
        </Spin>
      </PageContainer>
    </>
  );
};

RasnNaskahPreferences.getLayout = function getLayout(page) {
  return (
    <LayoutRasnNaskah active="/rasn-naskah/preferences">{page}</LayoutRasnNaskah>
  );
};

RasnNaskahPreferences.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default RasnNaskahPreferences;
