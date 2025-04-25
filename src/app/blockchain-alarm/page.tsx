"use client";

import { useState, useEffect } from 'react';
import {
    getUserDepositInfo
} from '@/lib/sui';
import { hasWallets, waitForWalletProvider } from '@/lib/sui-wallet';
import { getErrorMessage } from '@/lib/error-utils';
import { AlarmState, WalletType, DepositInfoType } from '@/components/blockchain-alarm/types';

// 导入组件
import BlockchainAlarmHeader from '@/components/blockchain-alarm/BlockchainAlarmHeader';
import BlockchainAlarmContent from '@/components/blockchain-alarm/BlockchainAlarmContent';

/**
 * 区块链早起闹钟页面 - 主页面组件
 */
export default function BlockchainAlarmPage() {
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

    // 检查钱包扩展是否安装
    useEffect(() => {
        const checkWalletExtension = async () => {
            // 等待钱包提供程序初始化
            await waitForWalletProvider(3000);

            // 检查是否有钱包扩展
            const hasExtension = hasWallets();

            setState(prev => ({
                ...prev,
                hasWalletExtension: hasExtension,
                walletCheckComplete: true,
            }));
        };

        checkWalletExtension();
    }, []);

    // 更新状态的辅助函数
    const updateState = (newState: Partial<AlarmState>) => {
        setState(prevState => ({ ...prevState, ...newState }));
    };

    // 获取用户存款信息
    const fetchDepositInfo = async (address: string) => {
        if (!address) return;

        updateState({ isLoading: true, error: null });

        try {
            const result = await getUserDepositInfo(address);
            if (result.success && result.data) {
                // 创建一个简单的对象来存储存款信息
                const depositData: DepositInfoType = {};

                // 由于result.data可能是复杂的嵌套数组，我们直接存储原始数据
                // 在界面上会用JSON.stringify显示
                updateState({
                    depositInfo: {
                        rawData: result.data,
                        // 添加一些默认的可读字段
                        amount: 0,
                        startDate: 0,
                        endDate: 0,
                        status: '进行中'
                    }
                });
            } else {
                console.warn('未找到存款信息');
            }
        } catch (error: unknown) {
            updateState({ error: getErrorMessage(error) });
        } finally {
            updateState({ isLoading: false });
        }
    };

    // 回调处理函数
    const handleWalletUpdate = (walletData: {
        isConnected: boolean;
        walletAddress: string;
        wallet: WalletType | null;
        balance: number;
    }) => {
        updateState(walletData);
    };

    const handleDepositAmountChange = (amount: number) => {
        updateState({ depositAmount: amount });
    };

    const handleWakeupTimeChange = (time: string) => {
        updateState({ wakeupTime: time });
    };

    const handleBalanceUpdate = (balance: number) => {
        updateState({ balance });
    };

    const handleError = (error: string) => {
        updateState({ error });
    };

    const handleStartLoading = () => {
        updateState({ isLoading: true, error: null });
    };

    const handleStopLoading = () => {
        updateState({ isLoading: false });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-base-100 to-base-200 bg-gradient-animated py-12 px-4 sm:px-6">
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
                    onFetchDepositInfo={fetchDepositInfo}
                    onError={handleError}
                    onStartLoading={handleStartLoading}
                    onStopLoading={handleStopLoading}
                />
            </div>
        </div>
    );
} 