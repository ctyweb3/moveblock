import React from 'react';
import WalletInstallGuide from './WalletInstallGuide';
import WalletConnect from './WalletConnect';
import FunctionalArea from './FunctionalArea';
import ErrorAlert from './ErrorAlert';
import BlockchainAlarmFooter from './BlockchainAlarmFooter';
import { WalletType, DepositInfoType } from './types';

interface BlockchainAlarmContentProps {
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
    onWalletUpdate: (walletData: {
        isConnected: boolean;
        walletAddress: string;
        wallet: WalletType | null;
        balance: number;
    }) => void;
    onDepositAmountChange: (amount: number) => void;
    onWakeupTimeChange: (time: string) => void;
    onBalanceUpdate: (balance: number) => void;
    onFetchDepositInfo: (address: string) => void;
    onError: (error: string) => void;
    onStartLoading: () => void;
    onStopLoading: () => void;
}

/**
 * 区块链闹钟主要内容区域组件
 */
const BlockchainAlarmContent: React.FC<BlockchainAlarmContentProps> = ({
    isConnected,
    walletAddress,
    balance,
    wallet,
    depositAmount,
    wakeupTime,
    depositInfo,
    isLoading,
    error,
    hasWalletExtension,
    walletCheckComplete,
    onWalletUpdate,
    onDepositAmountChange,
    onWakeupTimeChange,
    onBalanceUpdate,
    onFetchDepositInfo,
    onError,
    onStartLoading,
    onStopLoading
}) => {
    return (
        <div className="space-y-8">
            {/* 检查钱包状态 */}
            {walletCheckComplete && !hasWalletExtension ? (
                <WalletInstallGuide />
            ) : (
                <>
                    {/* 钱包连接组件 */}
                    <div className="transform transition-all hover:scale-[1.01] duration-300">
                        <WalletConnect
                            isConnected={isConnected}
                            walletAddress={walletAddress}
                            balance={balance}
                            wallet={wallet}
                            isLoading={isLoading}
                            walletCheckComplete={walletCheckComplete}
                            onWalletUpdate={onWalletUpdate}
                            onError={onError}
                            onStartLoading={onStartLoading}
                            onStopLoading={onStopLoading}
                        />
                    </div>

                    {/* 功能区域 - 仅在已连接钱包时显示 */}
                    <FunctionalArea
                        isConnected={isConnected}
                        wallet={wallet}
                        walletAddress={walletAddress}
                        depositAmount={depositAmount}
                        wakeupTime={wakeupTime}
                        depositInfo={depositInfo}
                        isLoading={isLoading}
                        onDepositAmountChange={onDepositAmountChange}
                        onWakeupTimeChange={onWakeupTimeChange}
                        onBalanceUpdate={onBalanceUpdate}
                        onFetchDepositInfo={onFetchDepositInfo}
                        onError={onError}
                        onStartLoading={onStartLoading}
                        onStopLoading={onStopLoading}
                    />
                </>
            )}

            {/* 错误信息 */}
            <ErrorAlert error={error} />

            {/* 页脚 */}
            <BlockchainAlarmFooter />
        </div>
    );
};

export default BlockchainAlarmContent; 