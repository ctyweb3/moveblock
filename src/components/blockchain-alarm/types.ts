/**
 * 区块链闹钟应用类型定义
 */

// 钱包类型
export interface WalletType {
    accounts: unknown[];
    chains: string[];
    features: Record<string, unknown>;
    name: string;
}

// 钱包连接组件属性
export interface WalletConnectProps {
    isConnected: boolean;
    walletAddress: string;
    balance: number;
    wallet: WalletType | null;
    isLoading: boolean;
    walletCheckComplete: boolean;
    onWalletUpdate: (walletData: {
        isConnected: boolean;
        walletAddress: string;
        wallet: WalletType | null;
        balance: number;
    }) => void;
    onError: (error: string) => void;
    onStartLoading: () => void;
    onStopLoading: () => void;
}

// 存款信息类型
export interface DepositInfoType {
    amount?: number;
    startDate?: number;
    endDate?: number;
    checkIns?: number;
    daysLeft?: number;
    status?: string;
    rawData?: unknown;
    [key: string]: unknown;
}

// 闹钟应用状态
export interface AlarmState {
    isConnected: boolean;
    walletAddress: string;
    balance: number;
    wallet: WalletType | null;
    depositAmount: number;
    wakeupTime: string;
    depositInfo: DepositInfoType | null;
    isLoading: boolean;
    error: string | null;
    hasWalletExtension: boolean;
    walletCheckComplete: boolean;
} 