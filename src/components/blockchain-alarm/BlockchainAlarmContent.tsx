import React from 'react';
import WalletConnect from './WalletConnect';
import FunctionalArea from './FunctionalArea';
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

                {/* 显示错误信息（如果有） */}
                {error && (
                    <div className="alert alert-error shadow-lg">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* 钱包扩展提示 */}
                {!hasWalletExtension && walletCheckComplete && (
                    <div className="alert alert-warning shadow-lg">
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>请安装Sui钱包扩展程序以使用此应用。</span>
                        </div>
                    </div>
                )}

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
                    onWalletUpdate={onWalletUpdate}
                />
            </>
        </div>
    );
};

export default BlockchainAlarmContent; 