import { searchUsers } from "@/services/rasn-mail.services";
import { Group, Stack, Text } from "@mantine/core";
import { Select } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

const RecipientSelector = ({
  recipients,
  onChange,
  showCc = false,
  showBcc = false,
  onToggleCc,
  onToggleBcc,
}) => {
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  const debouncedSearch = useCallback(async (text) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!text || text.length < 2) {
        setUserSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await searchUsers(text);
        if (response.success) {
          setUserSearchResults(
            response.data.map((u) => ({
              label: u.username,
              value: u.id,
              user: u,
            }))
          );
        }
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  useEffect(
    () => () => debounceRef.current && clearTimeout(debounceRef.current),
    []
  );

  const handleChange = (type, options) => {
    onChange({ ...recipients, [type]: options || [] });
  };

  const selectProps = {
    mode: "multiple",
    labelInValue: true,
    onSearch: debouncedSearch,
    loading: isSearching,
    showSearch: true,
    filterOption: false,
    notFoundContent: isSearching ? "Mencari..." : "Ketik 2+ karakter",
    style: { width: "100%" },
    size: "small",
    optionLabelProp: "label",
    options: userSearchResults.map((u) => ({
      label: u.label,
      value: u.value,
    })),
  };

  return (
    <Stack gap={6}>
      <Group align="flex-end" gap="xs">
        <div style={{ flex: 1 }}>
          <Text size="xs" fw={500} mb={2}>
            Kepada
          </Text>
          <Select
            {...selectProps}
            placeholder="Cari..."
            value={recipients.to}
            onChange={(val) => handleChange("to", val)}
          />
        </div>
        {!showCc && (
          <Text
            size="xs"
            c="blue"
            style={{ cursor: "pointer" }}
            onClick={onToggleCc}
          >
            +CC
          </Text>
        )}
        {!showBcc && (
          <Text
            size="xs"
            c="blue"
            style={{ cursor: "pointer" }}
            onClick={onToggleBcc}
          >
            +BCC
          </Text>
        )}
      </Group>

      {showCc && (
        <div>
          <Text size="xs" fw={500} mb={2}>
            CC
          </Text>
          <Select
            {...selectProps}
            placeholder="CC..."
            value={recipients.cc}
            onChange={(val) => handleChange("cc", val)}
          />
        </div>
      )}

      {showBcc && (
        <div>
          <Text size="xs" fw={500} mb={2}>
            BCC
          </Text>
          <Select
            {...selectProps}
            placeholder="BCC..."
            value={recipients.bcc}
            onChange={(val) => handleChange("bcc", val)}
          />
        </div>
      )}
    </Stack>
  );
};

export default RecipientSelector;
