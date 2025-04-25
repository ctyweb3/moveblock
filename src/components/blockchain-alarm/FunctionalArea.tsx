import React from 'react';
import HowToUseCard from './HowToUseCard';
import DepositAndWakeupForms from './DepositAndWakeupForms';
import WithdrawForm from './WithdrawForm';
import DepositInfo from './DepositInfo';
import { WalletType, DepositInfoType } from './types';

interface FunctionalAreaProps {
    isConnected: boolean;
    wallet: WalletType | null;
    walletAddress: string;
    depositAmount: number;
    wakeupTime: string;
    depositInfo: DepositInfoType | null;
    isLoading: boolean;
    onDepositAmountChange: (amount: number) => void;
    onWakeupTimeChange: (time: string) => void;
    onBalanceUpdate: (balance: number) => void;
    onFetchDepositInfo: (address: string) => void;
    onError: (error: string) => void;
    onStartLoading: () => void;
    onStopLoading: () => void;
}

/**
 * 功能区域组件 - 包含说明卡片、存款和起床时间表单、提取存款表单以及存款信息
 */
const FunctionalArea: React.FC<FunctionalAreaProps> = ({
    isConnected,
    wallet,
    walletAddress,
    depositAmount,
    wakeupTime,
    depositInfo,
    isLoading,
    onDepositAmountChange,
    onWakeupTimeChange,
    onBalanceUpdate,
    onFetchDepositInfo,
    onError,
    onStartLoading,
    onStopLoading
}) => {
    if (!isConnected) return null;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* 说明卡片 */}
            <HowToUseCard />

            {/* 存款和提交起床时间区域 */}
            <DepositAndWakeupForms
                isConnected={isConnected}
                wallet={wallet}
                walletAddress={walletAddress}
                depositAmount={depositAmount}
                wakeupTime={wakeupTime}
                isLoading={isLoading}
                onDepositAmountChange={onDepositAmountChange}
                onWakeupTimeChange={onWakeupTimeChange}
                onBalanceUpdate={onBalanceUpdate}
                onFetchDepositInfo={onFetchDepositInfo}
                onError={onError}
                onStartLoading={onStartLoading}
                onStopLoading={onStopLoading}
            />

            {/* 提取存款区域 */}
            <div className="transform transition-all hover:scale-[1.02] duration-300">
                <WithdrawForm
                    isConnected={isConnected}
                    wallet={wallet}
                    walletAddress={walletAddress}
                    isLoading={isLoading}
                    onBalanceUpdate={onBalanceUpdate}
                    onFetchDepositInfo={onFetchDepositInfo}
                    onError={onError}
                    onStartLoading={onStartLoading}
                    onStopLoading={onStopLoading}
                />
            </div>

            {/* 存款信息区域 */}
            {depositInfo && (
                <div className="transform transition-all hover:scale-[1.02] duration-300">
                    <DepositInfo depositInfo={depositInfo} />
                </div>
            )}
        </div>
    );
};

export default FunctionalArea; 