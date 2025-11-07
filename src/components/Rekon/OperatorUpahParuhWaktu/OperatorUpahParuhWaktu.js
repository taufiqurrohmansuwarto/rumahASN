import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { Card } from "antd";
import { message } from "antd";
import {
  useUnor,
  useUnorFasilitator,
  useOperatorGajiPW,
} from "./hooks/useOperatorQueries";
import {
  useAddOperator,
  useDeleteOperator,
} from "./hooks/useOperatorMutations";
import { useDownloadOperator } from "./hooks/useDownloadOperator";
import { formatUsername } from "./utils/helpers";
import {
  OperatorHeader,
  OperatorFilters,
  OperatorTransfer,
  EmptyState,
} from "./components";

const OperatorUpahParuhWaktu = () => {
  const router = useRouter();
  const [unorId, setUnorId] = useState(null);
  const [targetKeys, setTargetKeys] = useState([]);

  // Initialize unorId from query params
  useEffect(() => {
    if (router.isReady && router.query.unor_id) {
      setUnorId(router.query.unor_id);
    }
  }, [router.isReady, router.query.unor_id]);

  // Queries
  const {
    data: unor,
    isLoading: isLoadingUnor,
    refetch: refetchUnor,
  } = useUnor();

  const {
    data: unorFasilitator,
    isLoading: isLoadingUnorFasilitator,
    refetch: refetchFasilitator,
  } = useUnorFasilitator(unorId);

  const {
    data: operatorGajiPW,
    isLoading: isLoadingOperatorGajiPW,
    refetch: refetchOperator,
  } = useOperatorGajiPW(unorId);

  // Update targetKeys ketika operatorGajiPW berubah
  useEffect(() => {
    if (operatorGajiPW && Array.isArray(operatorGajiPW)) {
      const operatorKeys = operatorGajiPW.map((op) => op.user_id);
      setTargetKeys(operatorKeys);
    } else {
      setTargetKeys([]);
    }
  }, [operatorGajiPW]);

  // Mutations
  const { mutate: addOperator, isLoading: isAddingOperator } = useAddOperator(
    unorId,
    refetchOperator,
    refetchFasilitator
  );

  const { mutate: deleteOperator, isLoading: isDeletingOperator } =
    useDeleteOperator(unorId, refetchOperator, refetchFasilitator);

  const { mutate: downloadAllOperators, isLoading: isDownloading } =
    useDownloadOperator(unor);

  // Handlers
  const handleDownload = () => {
    downloadAllOperators();
  };

  const handleChangeUnor = (value) => {
    setUnorId(value);
    setTargetKeys([]);

    // Update URL query params
    if (value) {
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, unor_id: value },
        },
        undefined,
        { shallow: true }
      );
    } else {
      const { unor_id, ...restQuery } = router.query;
      router.replace(
        {
          pathname: router.pathname,
          query: restQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  };

  const handleRefresh = () => {
    refetchUnor();
    if (unorId) {
      refetchFasilitator();
      refetchOperator();
    }
  };

  // Prepare data untuk Transfer
  const transferData = useMemo(() => {
    if (!unorFasilitator || !Array.isArray(unorFasilitator)) return [];
    return unorFasilitator.map((item) => {
      const username = formatUsername(item.id, item.nama);

      return {
        key: item.id,
        title: username,
        description: item.opdId || "-",
        id: item.id,
        nama: item.nama,
        opdId: item.opdId,
        username: username,
      };
    });
  }, [unorFasilitator]);

  // Handle transfer change
  const handleTransferChange = (newTargetKeys, direction, moveKeys) => {
    if (!unorId) {
      message.warning("Pilih unit organisasi terlebih dahulu");
      return;
    }

    if (direction === "right") {
      // Menambahkan operator
      moveKeys.forEach((user_id) => {
        addOperator({ unor_id: unorId, user_id });
      });
    } else if (direction === "left") {
      // Menghapus operator
      moveKeys.forEach((user_id) => {
        const operator = operatorGajiPW?.find((op) => op.user_id === user_id);
        if (operator?.id) {
          deleteOperator({ id: operator.id });
        }
      });
    }
  };

  return (
    <div>
      <div style={{ maxWidth: "100%" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          <OperatorHeader />

          <OperatorFilters
            unor={unor}
            unorId={unorId}
            isLoadingUnor={isLoadingUnor}
            isLoadingUnorFasilitator={isLoadingUnorFasilitator}
            isLoadingOperatorGajiPW={isLoadingOperatorGajiPW}
            isAddingOperator={isAddingOperator}
            isDeletingOperator={isDeletingOperator}
            isDownloading={isDownloading}
            onUnorChange={handleChangeUnor}
            onRefresh={handleRefresh}
            onDownload={handleDownload}
          />

          {unorId ? (
            <OperatorTransfer
              transferData={transferData}
              targetKeys={targetKeys}
              isLoadingUnorFasilitator={isLoadingUnorFasilitator}
              isLoadingOperatorGajiPW={isLoadingOperatorGajiPW}
              isAddingOperator={isAddingOperator}
              isDeletingOperator={isDeletingOperator}
              onTransferChange={handleTransferChange}
            />
          ) : (
            <EmptyState />
          )}
        </Card>
      </div>
    </div>
  );
};

export default OperatorUpahParuhWaktu;
