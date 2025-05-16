"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getUserDepositInfo
} from '@/lib/sui';
import { hasWallets, waitForWalletProvider } from '@/lib/sui-wallet';
import { getErrorMessage } from '@/lib/error-utils';
import { AlarmState, WalletType } from '@/components/blockchain-alarm/types';

// 导入组件
import BlockchainAlarmHeader from '@/components/blockchain-alarm/BlockchainAlarmHeader';
import BlockchainAlarmContent from '@/components/blockchain-alarm/BlockchainAlarmContent';
import { ConnectButton } from '@mysten/dapp-kit';

/**
 * 区块链早起闹钟页面 - 主页面组件
 */
export default function BlockchainAlarmPage() {
    // 使用ref追踪是否已经请求过存款信息
    const hasRequestedDepositInfo = useRef<boolean>(false);
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 状态初始化
    const [state, setState] = useState<AlarmState>({
        isConnected: false,
        walletAddress: '',
        balance: 0,
        wallet: null,
        depositAmount: 2.1, // 默认存款金额
        wakeupTime: '07:00', // 默认起床时间
        depositInfo: null,
        isLoading: false,
        error: null,
        hasWalletExtension: false,
        walletCheckComplete: false,
    });

    // 更新状态的辅助函数 - 使用useCallback避免重复创建
    const updateState = useCallback((newState: Partial<AlarmState>) => {
        setState(prevState => ({ ...prevState, ...newState }));
    }, []);

    // 获取用户存款信息 - 使用useCallback缓存函数
    const fetchDepositInfo = useCallback(async (address: string) => {
        // 防止重复调用和空地址
        if (!address || state.isLoading) return;

        console.log('正在获取存款信息:', address);
        updateState({ isLoading: true, error: null });

        try {
            const result = await getUserDepositInfo(address);
            if (result.success && result.data) {
                // 解析存款数据
                try {
                    if (Array.isArray(result.data) && result.data.length > 0) {
                        const [amount, startDate, endDate, checkIns] = result.data;
                        // 确保数据类型正确
                        const amountValue = typeof amount === 'object' && amount !== null ? String(amount[0]) : '0';
                        const startDateValue = typeof startDate === 'object' && startDate !== null ? String(startDate[0]) : '0';
                        const endDateValue = typeof endDate === 'object' && endDate !== null ? String(endDate[0]) : '0';
                        const checkInsValue = typeof checkIns === 'object' && checkIns !== null ? String(checkIns[0]) : '0';

                        const parsedAmount = parseFloat(amountValue) / 1000000000; // 转换为SUI单位

                        // 计算剩余天数
                        const now = Math.floor(Date.now() / 1000);
                        const endTimestamp = parseInt(endDateValue);
                        const daysLeft = Math.max(0, Math.ceil((endTimestamp - now) / (24 * 60 * 60)));

                        // 更新存款详细信息
                        updateState({
                            depositInfo: {
                                rawData: result.data,
                                amount: parsedAmount,
                                startDate: parseInt(startDateValue),
                                endDate: endTimestamp,
                                checkIns: parseInt(checkInsValue),
                                daysLeft: daysLeft,
                                status: daysLeft > 0 ? '进行中' : '已完成'
                            }
                        });
                    } else {
                        updateState({
                            depositInfo: null
                        });
                    }
                } catch (parseError) {
                    console.warn('解析存款数据失败:', parseError);
                    updateState({
                        depositInfo: {
                            rawData: result.data,
                            amount: 0,
                            startDate: 0,
                            endDate: 0,
                            status: '未知'
                        }
                    });
                }
            } else {
                updateState({ depositInfo: null });
                console.warn('未找到存款信息');
            }
        } catch (error: unknown) {
            updateState({ error: getErrorMessage(error) });
        } finally {
            updateState({ isLoading: false });
            // 设置标志，表示已经请求过存款信息
            hasRequestedDepositInfo.current = true;
        }
    }, [updateState, state.isLoading]);

    // 检查钱包扩展是否安装
    useEffect(() => {
        const checkWalletExtension = async () => {
            // 等待钱包提供程序初始化
            await waitForWalletProvider(3000);

            // 检查是否有钱包扩展
            const hasExtension = hasWallets();

            updateState({
                hasWalletExtension: hasExtension,
                walletCheckComplete: true,
            });
        };

        checkWalletExtension();
    }, [updateState]);

    // 钱包连接状态变化时获取存款信息 - 重构以避免循环
    useEffect(() => {
        // 清除现有的超时
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
            fetchTimeoutRef.current = null;
        }

        // 仅当钱包已连接、有地址，且还未请求过存款信息(或明确要求刷新)时获取数据
        if (state.isConnected && state.walletAddress && !state.isLoading && !hasRequestedDepositInfo.current) {
            console.log('准备获取存款信息，设置超时...');
            // 设置新的超时
            fetchTimeoutRef.current = setTimeout(() => {
                fetchDepositInfo(state.walletAddress);
            }, 1000); // 增加延迟防止频繁调用
        }

        // 组件卸载时清理
        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [state.isConnected, state.walletAddress, state.isLoading, fetchDepositInfo]);

    // 回调处理函数 - 使用useCallback缓存函数
    const handleWalletUpdate = useCallback((walletData: {
        isConnected: boolean;
        walletAddress: string;
        wallet: WalletType | null;
        balance: number;
    }) => {
        // 如果连接状态发生变化（从已连接变为未连接，或者地址变化）
        if (state.isConnected !== walletData.isConnected || state.walletAddress !== walletData.walletAddress) {
            // 重置存款信息请求标志
            hasRequestedDepositInfo.current = false;
        }
        updateState(walletData);
    }, [state.isConnected, state.walletAddress, updateState]);

    // 手动触发的存款信息刷新，不会受到标志限制
    const manualFetchDepositInfo = useCallback((address: string) => {
        // 重置标志，允许再次获取
        hasRequestedDepositInfo.current = false;
        // 清除任何现有的超时
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }
        // 立即获取存款信息
        fetchDepositInfo(address);
    }, [fetchDepositInfo]);

    const handleDepositAmountChange = useCallback((amount: number) => {
        updateState({ depositAmount: amount });
    }, [updateState]);

    const handleWakeupTimeChange = useCallback((time: string) => {
        updateState({ wakeupTime: time });
    }, [updateState]);

    const handleBalanceUpdate = useCallback((balance: number) => {
        updateState({ balance });
    }, [updateState]);

    const handleError = useCallback((error: string) => {
        updateState({ error });
    }, [updateState]);

    const handleStartLoading = useCallback(() => {
        updateState({ isLoading: true, error: null });
    }, [updateState]);

    const handleStopLoading = useCallback(() => {
        updateState({ isLoading: false });
    }, [updateState]);

    // 避免不必要的渲染
    return (
        <div className="min-h-screen bg-gradient-to-b from-base-100 to-base-200 bg-gradient-animated py-12 px-4 sm:px-6">
            {/* 测试用连接按钮 - 修复CSS问题 */}
            <div className="flex justify-center mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative z-10">
                <div className="text-center w-full">
                    <h3 className="text-lg font-medium mb-3">测试钱包连接</h3>
                    {/* 为ConnectButton添加自定义样式，确保它可以被点击 */}
                    <div className="connect-button-container relative z-20 py-2">
                        <ConnectButton />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                {/* 页面标题 */}
                <BlockchainAlarmHeader />

                {/* 主要内容区域 */}
                <BlockchainAlarmContent
                    isConnected={state.isConnected}
                    walletAddress={state.walletAddress}
                    balance={state.balance}
                    wallet={state.wallet}
                    depositAmount={state.depositAmount}
                    wakeupTime={state.wakeupTime}
                    depositInfo={state.depositInfo}
                    isLoading={state.isLoading}
                    error={state.error}
                    hasWalletExtension={state.hasWalletExtension}
                    walletCheckComplete={state.walletCheckComplete}
                    onWalletUpdate={handleWalletUpdate}
                    onDepositAmountChange={handleDepositAmountChange}
                    onWakeupTimeChange={handleWakeupTimeChange}
                    onBalanceUpdate={handleBalanceUpdate}
                    onFetchDepositInfo={manualFetchDepositInfo}
                    onError={handleError}
                    onStartLoading={handleStartLoading}
                    onStopLoading={handleStopLoading}
                />
            </div>
        </div>
    );
} 