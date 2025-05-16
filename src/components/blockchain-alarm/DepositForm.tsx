import React, { useState, useCallback } from 'react';
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
    // 本地状态管理
    const [localError, setLocalError] = useState<string | null>(null);
    const [isDepositing, setIsDepositing] = useState(false);
    const [txId, setTxId] = useState<string | null>(null);

    // 处理存款 - 使用useCallback避免不必要的重新创建
    const handleDeposit = useCallback(async () => {
        if (!wallet || !isConnected) {
            onError('请先连接钱包');
            return;
        }

        // 防止重复提交
        if (isDepositing || isLoading) return;

        // 清除先前的错误和状态
        setLocalError(null);
        setTxId(null);
        setIsDepositing(true);
        onStartLoading();

        console.log('开始存款流程，使用钱包:', wallet.name);
        console.log('存款金额:', depositAmount, 'SUI');

        try {
            // 检查钱包对象是否有必要的属性
            if (!wallet.accounts || !wallet.accounts.length) {
                throw new Error('钱包账户信息不可用，请重新连接钱包');
            }

            // 获取钱包对象中的signAndExecuteTransactionBlock方法
            // 由于类型原因，需要确定钱包对象的正确方法
            const walletWithSignMethod =
                wallet.accounts[0] && typeof (wallet.accounts[0] as any).signAndExecuteTransactionBlock === 'function'
                    ? wallet.accounts[0]  // 使用第一个账户
                    : (wallet as any).signAndExecuteTransactionBlock
                        ? wallet  // 使用钱包对象本身
                        : null;   // 无法找到签名方法

            if (!walletWithSignMethod) {
                console.error('无法找到钱包的签名方法');
                throw new Error('不支持的钱包类型，无法执行交易');
            }

            console.log('使用钱包进行交易签名:', walletWithSignMethod);

            // 执行存款交易
            const tx = await depositToContract(walletWithSignMethod, depositAmount);

            if (tx.success && tx.txId) {
                // 存储交易ID
                setTxId(tx.txId);

                // 刷新余额和存款信息
                try {
                    const balanceResult = await getBalance(walletAddress);
                    if (balanceResult.success) {
                        onBalanceUpdate(balanceResult.totalBalance);
                    }
                } catch (balanceError) {
                    console.warn('获取余额失败:', balanceError);
                }

                // 等待几秒后获取存款信息，以确保链上数据已更新
                setTimeout(() => {
                    if (walletAddress) {
                        onFetchDepositInfo(walletAddress);
                    }
                }, 3000);

                alert('存款成功！交易ID: ' + tx.txId);
            } else {
                const errorMsg = tx.errorMessage || '存款失败，请检查控制台获取详细信息';
                throw new Error(errorMsg);
            }
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            console.error('存款操作出错:', errorMessage);
            setLocalError(errorMessage);
            onError(errorMessage);
        } finally {
            setIsDepositing(false);
            onStopLoading();
        }
    }, [wallet, isConnected, isDepositing, isLoading, depositAmount, walletAddress, onBalanceUpdate, onError, onFetchDepositInfo, onStartLoading, onStopLoading]);

    // 处理金额输入变化 - 防抖处理
    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 只有当输入是一个有效的数字或为空时才更新状态
        if (value === '' || !isNaN(parseFloat(value))) {
            onDepositAmountChange(parseFloat(value) || 0);
        }
    }, [onDepositAmountChange]);

    return (
        <div className="bg-base-200 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <h2 className="text-xl font-bold">存款</h2>
            </div>

            {/* 显示本地错误 */}
            {localError && (
                <div className="alert alert-error shadow-lg mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <span className="font-bold">错误:</span> {localError}
                    </div>
                </div>
            )}

            {/* 显示交易ID */}
            {txId && (
                <div className="alert alert-success shadow-lg mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <span className="font-bold">交易成功!</span>
                        <div className="text-xs font-mono break-all mt-1">
                            ID: {txId}
                        </div>
                    </div>
                </div>
            )}

            <div className="form-control">
                <label className="label">
                    <span className="label-text">存款金额 (最少 2.1 SUI)</span>
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        className="input input-bordered w-full"
                        value={depositAmount || ''}
                        onChange={handleAmountChange}
                        min="2.1"
                        step="0.1"
                        disabled={isLoading || isDepositing}
                    />
                    <span className="text-sm font-medium">SUI</span>
                </div>
            </div>

            <button
                className="btn btn-success btn-block mt-5 gap-2"
                onClick={handleDeposit}
                disabled={!isConnected || isLoading || isDepositing || depositAmount < 2.1}
            >
                {(isLoading || isDepositing) ? (
                    <span className="loading loading-spinner"></span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
                {(isLoading || isDepositing) ? '处理中...' : '确认存款'}
            </button>

            <div className="alert alert-info mt-4 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <p className="text-xs">存款将被锁定21天，期间每日需要打卡记录起床时间。</p>
                    <p className="text-xs mt-1">如果您的钱包余额不足，请先获取测试币。</p>
                </div>
            </div>
        </div>
    );
};

export default DepositForm; 