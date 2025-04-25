import React from 'react';
import { connectWallet, disconnectWallet } from '@/lib/sui-wallet';
import { getBalance, requestSuiFromFaucet } from '@/lib/sui';
import { getErrorMessage } from '@/lib/error-utils';
import { WalletConnectProps } from './types';

/**
 * 钱包连接组件 - 处理钱包连接、断开连接和显示钱包信息
 */
const WalletConnect: React.FC<WalletConnectProps> = ({
    isConnected,
    walletAddress,
    balance,
    wallet,
    isLoading,
    walletCheckComplete,
    onWalletUpdate,
    onError,
    onStartLoading,
    onStopLoading
}) => {
    // 连接钱包
    const handleConnectWallet = async () => {
        onStartLoading();

        try {
            const result = await connectWallet();

            if (result.success) {
                const address = result.currentAccount.address;

                // 获取余额
                const balanceResult = await getBalance(address);

                onWalletUpdate({
                    isConnected: true,
                    walletAddress: address,
                    wallet: result.wallet,
                    balance: balanceResult.success ? balanceResult.totalBalance : 0,
                });
            } else {
                throw new Error(result.error ? getErrorMessage(result.error) : '连接钱包失败');
            }
        } catch (error: unknown) {
            onError(getErrorMessage(error));
        } finally {
            onStopLoading();
        }
    };

    // 断开钱包连接
    const handleDisconnectWallet = async () => {
        if (!wallet) return;

        onStartLoading();

        try {
            await disconnectWallet(wallet);
            onWalletUpdate({
                isConnected: false,
                walletAddress: '',
                wallet: null,
                balance: 0,
            });
        } catch (error: unknown) {
            onError(getErrorMessage(error));
        } finally {
            onStopLoading();
        }
    };

    // 从水龙头获取测试币
    const handleGetTestTokens = async () => {
        if (!walletAddress) {
            onError('请先连接钱包');
            return;
        }

        onStartLoading();

        try {
            const result = await requestSuiFromFaucet(walletAddress);
            if (result.success) {
                // 刷新余额
                const balanceResult = await getBalance(walletAddress);
                if (balanceResult.success) {
                    onWalletUpdate({
                        isConnected,
                        walletAddress,
                        wallet,
                        balance: balanceResult.totalBalance,
                    });
                }

                alert('测试币获取成功！');
            } else {
                throw new Error('获取测试币失败');
            }
        } catch (error: unknown) {
            onError(getErrorMessage(error));
        } finally {
            onStopLoading();
        }
    };

    return (
        <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
                <h2 className="card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    钱包状态
                </h2>

                {!isConnected ? (
                    <div className="flex justify-center py-4">
                        <button
                            className="btn btn-primary btn-lg gap-2"
                            onClick={handleConnectWallet}
                            disabled={isLoading || !walletCheckComplete}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    连接中...
                                </>
                            ) : !walletCheckComplete ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    检查钱包...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                    </svg>
                                    连接钱包
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium text-gray-700">钱包地址:</p>
                                <p className="text-sm font-mono bg-base-300 p-2 rounded">{walletAddress}</p>
                            </div>
                            <button
                                className="btn btn-outline btn-error gap-2"
                                onClick={handleDisconnectWallet}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                断开连接
                            </button>
                        </div>
                        <div className="flex items-center justify-between mt-2 p-3 bg-base-300 rounded-lg">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium text-lg">{balance.toFixed(4)} SUI</span>
                            </div>
                            <button
                                className="btn btn-info btn-sm gap-1"
                                onClick={handleGetTestTokens}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                )}
                                获取测试币
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WalletConnect; 