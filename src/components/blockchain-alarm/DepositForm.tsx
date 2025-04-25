import React from 'react';
import { depositToContract, getBalance } from '@/lib/sui';
import { getErrorMessage } from '@/lib/error-utils';
import { WalletType } from './types';

interface DepositFormProps {
    isConnected: boolean;
    wallet: WalletType | null;
    walletAddress: string;
    depositAmount: number;
    isLoading: boolean;
    onDepositAmountChange: (amount: number) => void;
    onBalanceUpdate: (balance: number) => void;
    onFetchDepositInfo: (address: string) => void;
    onError: (error: string) => void;
    onStartLoading: () => void;
    onStopLoading: () => void;
}

/**
 * 存款表单组件 - 处理存款操作
 */
const DepositForm: React.FC<DepositFormProps> = ({
    isConnected,
    wallet,
    walletAddress,
    depositAmount,
    isLoading,
    onDepositAmountChange,
    onBalanceUpdate,
    onFetchDepositInfo,
    onError,
    onStartLoading,
    onStopLoading
}) => {
    // 处理存款
    const handleDeposit = async () => {
        if (!wallet || !isConnected) {
            onError('请先连接钱包');
            return;
        }

        onStartLoading();

        try {
            const tx = await depositToContract(wallet, depositAmount);

            if (tx.success) {
                // 刷新余额和存款信息
                const balanceResult = await getBalance(walletAddress);
                if (balanceResult.success) {
                    onBalanceUpdate(balanceResult.totalBalance);
                }

                onFetchDepositInfo(walletAddress);

                alert('存款成功！');
            } else {
                throw new Error('存款失败');
            }
        } catch (error: unknown) {
            onError(getErrorMessage(error));
        } finally {
            onStopLoading();
        }
    };

    return (
        <div className="bg-base-200 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <h2 className="text-xl font-bold">存款</h2>
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text">存款金额 (最少 2.1 SUI)</span>
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        className="input input-bordered w-full"
                        value={depositAmount}
                        onChange={(e) => onDepositAmountChange(parseFloat(e.target.value))}
                        min="2.1"
                        step="0.1"
                    />
                    <span className="text-sm font-medium">SUI</span>
                </div>
            </div>
            <button
                className="btn btn-success btn-block mt-5 gap-2"
                onClick={handleDeposit}
                disabled={!isConnected || isLoading || depositAmount < 2.1}
            >
                {isLoading ? (
                    <span className="loading loading-spinner"></span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
                {isLoading ? '处理中...' : '确认存款'}
            </button>
            <p className="text-xs text-gray-500 mt-3">存款将被锁定21天，期间每日需要打卡记录起床时间</p>
        </div>
    );
};

export default DepositForm; 