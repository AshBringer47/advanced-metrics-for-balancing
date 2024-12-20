import axios from 'axios';
import si from 'systeminformation';

export interface QueueManagerWithMetrics {
    getQueueSize(): Promise<number>;
}

export type SyncMetrics = {
    cpuUsage: number;
    ramUsage: number;
};

export type AsyncMetrics = SyncMetrics & {
    queueSize: number;
};

export type Metrics = SyncMetrics | AsyncMetrics;

export type ConsulCheckInRequest = {
    Name: string;
    Tag: string;
    Address: string;
    Port: number;
    Check: {
        HTTP: string;
        Interval: string;
    };
};

export async function getSyncMetrics(): Promise<SyncMetrics> {
    // Отримати дані про використання CPU
    const cpuData = await si.currentLoad();
    const cpuUsage = parseFloat(cpuData.currentLoad.toFixed(2));

    // Отримати дані про використання оперативної пам'яті
    const memData = await si.mem();
    const usedMem = memData.active; // Active memory in bytes
    const totalMem = memData.total; // Total memory in bytes
    const ramUsage = parseFloat(((usedMem / totalMem) * 100).toFixed(2));

    return {
        cpuUsage,
        ramUsage,
    };
}

export async function getAsyncMetrics(
    queueManager: QueueManagerWithMetrics,
): Promise<AsyncMetrics> {
    const syncMetrics = await getSyncMetrics();
    const queueSize = await queueManager.getQueueSize();

    return {
        ...syncMetrics,
        queueSize,
    };
}

export async function consulCheckIn(
    consulUrl: string,
    input: ConsulCheckInRequest,
) {
    await axios.put(`${consulUrl}/v1/agent/service/register`, input);
}
