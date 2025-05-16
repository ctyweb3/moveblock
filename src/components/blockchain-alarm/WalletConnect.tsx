import React, { useEffect, useCallback, useRef } from 'react';
import { useCurrentAccount, useDisconnectWallet, useSuiClient, useConnectWallet, useWallets } from '@mysten/dapp-kit';
import { ConnectButton } from '@mysten/dapp-kit';
import { getErrorMessage } from '@/lib/error-utils';
import { WalletConnectProps } from './types';
import { requestSuiFromFaucet } from '@/lib/sui';

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
    // 使用ref跟踪上一次的账户状态，避免不必要的更新
    const prevAccountRef = useRef<unknown>(null);
    const updatingRef = useRef<boolean>(false);

    // 使用dapp-kit hooks
    const account = useCurrentAccount();
    const { mutate: disconnectWallet } = useDisconnectWallet();
    const suiClient = useSuiClient();
    const { mutate: connectWallet } = useConnectWallet();
    const wallets = useWallets();

    // 获取钱包余额 - 使用 useCallback 包装
    const getBalance = useCallback(async (address: string) => {
        try {
            const coins = await suiClient.getCoins({
                owner: address,
                coinType: "0x2::sui::SUI"
            });

            const totalBalance = coins.data.reduce((sum, coin) => {
                return sum + BigInt(coin.balance);
            }, BigInt(0));

            return {
                success: true,
                totalBalance: Number(totalBalance) / 1_000_000_000 // 转换为SUI单位
            };
        } catch (error) {
            console.error("获取余额失败:", error);
            return { success: false, totalBalance: 0 };
        }
    }, [suiClient]);

    // 自定义连接钱包函数 - 确保不会被拦截
    const handleConnectWallet = useCallback((event: React.MouseEvent) => {
        // 阻止事件冒泡
        event.stopPropagation();

        // 防止重复操作
        if (updatingRef.current || isLoading) return;
        updatingRef.current = true;

        if (wallets.length > 0) {
            console.log("尝试连接钱包:", wallets[0].name);
            try {
                onStartLoading();
                connectWallet({ wallet: wallets[0] });
            } catch (error) {
                console.error("连接钱包错误:", error);
                onError(getErrorMessage(error));
                onStopLoading();
            }
        } else {
            onError("未检测到钱包插件! 请安装Sui钱包插件。");
        }

        // 防止组件被卡在加载状态
        setTimeout(() => {
            onStopLoading();
            updatingRef.current = false;
        }, 3000);
    }, [wallets, isLoading, onStartLoading, onError, connectWallet, onStopLoading]);

    // 监听账户变化
    useEffect(() => {
        // 如果账户没有变化且不是初始化，则跳过更新
        if (account === prevAccountRef.current && prevAccountRef.current !== null) {
            return;
        }

        // 更新前一个账户引用
        prevAccountRef.current = account;

        // 防止重复更新
        if (updatingRef.current) return;
        updatingRef.current = true;

        const updateWallet = async () => {
            if (account) {
                onStartLoading();
                try {
                    const address = account.address;

                    // 获取余额
                    const balanceResult = await getBalance(address);

                    // 更新钱包信息
                    onWalletUpdate({
                        isConnected: true,
                        walletAddress: address,
                        wallet: {
                            accounts: [account],
                            chains: Array.from(account.chains), // 转换为可变数组
                            features: {},
                            name: account.label || 'Sui Wallet'
                        },
                        balance: balanceResult.success ? balanceResult.totalBalance : 0,
                    });
                } catch (error) {
                    onError(getErrorMessage(error));
                } finally {
                    onStopLoading();
                    updatingRef.current = false;
                }
            } else if (isConnected) {
                // 如果没有账户但之前已连接，说明用户已断开连接
                onWalletUpdate({
                    isConnected: false,
                    walletAddress: '',
                    wallet: null,
                    balance: 0,
                });
                updatingRef.current = false;
            } else {
                updatingRef.current = false;
            }
        };

        // 使用setTimeout减少渲染压力
        const timer = setTimeout(() => {
            updateWallet();
        }, 300);

        return () => clearTimeout(timer);
    }, [account, isConnected, onError, onStartLoading, onStopLoading, onWalletUpdate, getBalance]);

    // 断开钱包连接
    const handleDisconnectWallet = useCallback(() => {
        // 防止重复操作
        if (updatingRef.current || isLoading) return;
        updatingRef.current = true;

        onStartLoading();
        try {
            disconnectWallet();
            // 断开连接后的状态更新会通过上面的useEffect处理
        } catch (error) {
            onError(getErrorMessage(error));
            onStopLoading();
        } finally {
            setTimeout(() => {
                updatingRef.current = false;
            }, 1000);
        }
    }, [disconnectWallet, isLoading, onError, onStartLoading, onStopLoading]);

    // 获取测试币
    const handleGetTestTokens = useCallback(async () => {
        if (!walletAddress || updatingRef.current || isLoading) return;
        updatingRef.current = true;

        onStartLoading();

        try {
            const result = await requestSuiFromFaucet(walletAddress);

            if (result.success) {
                // 获取新余额
                const balanceResult = await getBalance(walletAddress);

                if (balanceResult.success) {
                    onWalletUpdate({
                        isConnected,
                        walletAddress,
                        wallet,
                        balance: balanceResult.totalBalance,
                    });
                }

                alert('成功获取测试币！');
            } else {
                throw new Error('获取测试币失败');
            }
        } catch (error) {
            onError(getErrorMessage(error));
        } finally {
            onStopLoading();
            updatingRef.current = false;
        }
    }, [walletAddress, isLoading, onStartLoading, getBalance, isConnected, wallet, onWalletUpdate, onError, onStopLoading]);

    // 调试信息 - 获取可用钱包数量
    const availableWallets = wallets.length;

    // 强制重置加载状态（防止长时间加载）
    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                onStopLoading();
                updatingRef.current = false;
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, onStopLoading]);

    // 使用 memo 减少重新渲染
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
                    <div className="space-y-4 py-4">
                        {/* 调试信息 */}
                        <div className="text-center text-sm text-gray-500 mt-2">
                            <p>检测到的钱包数量: {availableWallets}</p>
                            <p>钱包检查完成: {walletCheckComplete ? '是' : '否'}</p>
                            <p>加载状态: {isLoading ? '加载中' : '空闲'}</p>
                            {wallets.map((w, i) => (
                                <p key={i}>{w.name || '未命名钱包'}</p>
                            ))}
                        </div>

                        {/* 原始的ConnectButton */}
                        <div className="flex justify-center">
                            <ConnectButton />
                        </div>

                        {/* 强制可点击的连接按钮 */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleConnectWallet}
                                className="btn btn-primary z-50 relative"
                                style={{ zIndex: 999 }}
                                disabled={isLoading || updatingRef.current}
                            >
                                {isLoading ? (
                                    <span className="loading loading-spinner loading-xs mr-2"></span>
                                ) : null}
                                强制连接钱包
                            </button>
                        </div>
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
                                disabled={isLoading || updatingRef.current}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                断开连接
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium text-lg">{balance.toFixed(4)} SUI</span>
                        </div>
                        <button
                            className="btn btn-info btn-sm gap-1"
                            onClick={handleGetTestTokens}
                            disabled={isLoading || updatingRef.current}
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
                )}
            </div>
        </div>
    );
};

export default WalletConnect; 