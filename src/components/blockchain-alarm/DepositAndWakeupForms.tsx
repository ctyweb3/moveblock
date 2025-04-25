import React from 'react';
import DepositForm from './DepositForm';
import WakeupTimeForm from './WakeupTimeForm';
import { WalletType } from './types';

interface DepositAndWakeupFormsProps {
    isConnected: boolean;
    wallet: WalletType | null;
    walletAddress: string;
    depositAmount: number;
    wakeupTime: string;
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
 * 存款和起床时间表单区域组件
 */
const DepositAndWakeupForms: React.FC<DepositAndWakeupFormsProps> = ({
    isConnected,
    wallet,
    walletAddress,
    depositAmount,
    wakeupTime,
    isLoading,
    onDepositAmountChange,
    onWakeupTimeChange,
    onBalanceUpdate,
    onFetchDepositInfo,
    onError,
    onStartLoading,
    onStopLoading
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="transform transition-all hover:scale-[1.02] duration-300">
                <DepositForm
                    isConnected={isConnected}
                    wallet={wallet}
                    walletAddress={walletAddress}
                    depositAmount={depositAmount}
                    isLoading={isLoading}
                    onDepositAmountChange={onDepositAmountChange}
                    onBalanceUpdate={onBalanceUpdate}
                    onFetchDepositInfo={onFetchDepositInfo}
                    onError={onError}
                    onStartLoading={onStartLoading}
                    onStopLoading={onStopLoading}
                />
            </div>

            <div className="transform transition-all hover:scale-[1.02] duration-300">
                <WakeupTimeForm
                    isConnected={isConnected}
                    wallet={wallet}
                    walletAddress={walletAddress}
                    wakeupTime={wakeupTime}
                    isLoading={isLoading}
                    onWakeupTimeChange={onWakeupTimeChange}
                    onFetchDepositInfo={onFetchDepositInfo}
                    onError={onError}
                    onStartLoading={onStartLoading}
                    onStopLoading={onStopLoading}
                />
            </div>
        </div>
    );
};

export default DepositAndWakeupForms; 