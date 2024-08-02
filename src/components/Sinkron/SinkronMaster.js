import { syncPegawaiMaster } from "@/services/sync.services";
import { useMutation } from "@tanstack/react-query";

const { Button, message } = require("antd")

const SinkronMaster = () => {
    const { mutate, isLoading } = useMutation(() => syncPegawaiMaster(), {
        onSuccess: () => { message.success('berhasil') },
        onError: () => { message.error('gagal') }
    });

    const handleClick = () => {
        mutate();
    }

    return <Button onClick={handleClick} loading={isLoading} disabled={isLoading}>Sync</Button>
}

export default SinkronMaster;