import React from 'react';
import { withdrawDeposit, getBalance } from '@/lib/sui';
import { getErrorMessage } from '@/lib/error-utils';
import { WalletType } from './types';

interface WithdrawFormProps {
    isConnected: boolean;
    wallet: WalletType | null;
    walletAddress: string;
    isLoading: boolean;
    onBalanceUpdate: (balance: number) => void;
    onFetchDepositInfo: (address: string) => void;
    onError: (error: string) => void;
    onStartLoading: () => void;
    onStopLoading: () => void;
}

/**
 * 提取存款组件 - 处理存款提取操作
 */
const WithdrawForm: React.FC<WithdrawFormProps> = ({
    isConnected,
    wallet,
    walletAddress,
    isLoading,
    onBalanceUpdate,
    onFetchDepositInfo,
    onError,
    onStartLoading,
    onStopLoading
}) => {
    // 处理提取存款
    const handleWithdraw = async () => {
        if (!wallet || !isConnected) {
            onError('请先连接钱包');
            return;
        }

        onStartLoading();

        try {
            const tx = await withdrawDeposit(wallet);

            if (tx.success) {
                // 刷新余额和存款信息
                const balanceResult = await getBalance(walletAddress);
                if (balanceResult.success) {
                    onBalanceUpdate(balanceResult.totalBalance);
                }

                onFetchDepositInfo(walletAddress);

                alert('存款提取成功！');
            } else {
                throw new Error('提取存款失败');
            }
        } catch (error: unknown) {
            onError(getErrorMessage(error));
        } finally {
            onStopLoading();
        }
    };

    return (
        <div className="bg-base-200 p-6 rounded-lg shadow-lg my-6">
            <div className="flex items-center gap-3 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <h2 className="text-xl font-bold">提取存款</h2>
            </div>
            <div className="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>21天后或到期后可提取全部或剩余存款</span>
            </div>
            <button
                className="btn btn-secondary btn-block gap-2"
                onClick={handleWithdraw}
                disabled={!isConnected || isLoading}
            >
                {isLoading ? (
                    <span className="loading loading-spinner"></span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9a2 2 0 10-4 0v5a2 2 0 104 0V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6v6H9z" />
                    </svg>
                )}
                {isLoading ? '处理中...' : '提取存款'}
            </button>
        </div>
    );
};

export default WithdrawForm; 