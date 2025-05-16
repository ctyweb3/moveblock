import React, { useState, useEffect, useCallback, useRef } from 'react';
import { submitWakeupTime } from '@/lib/sui';
import { getErrorMessage } from '@/lib/error-utils';
import { WalletType } from './types';

// 定义具有签名方法的钱包或账户的接口
interface SigningWallet {
    signAndExecuteTransactionBlock: (params: { transactionBlock: unknown }) => Promise<{ digest: string }>;
}

interface WakeupTimeFormProps {
    isConnected: boolean;
    wallet: WalletType | null;
    walletAddress: string;
    wakeupTime: string;
    isLoading: boolean;
    onWakeupTimeChange: (time: string) => void;
    onFetchDepositInfo: (address: string) => void;
    onError: (error: string) => void;
    onStartLoading: () => void;
    onStopLoading: () => void;
}

/**
 * 起床时间提交组件 - 处理起床时间提交
 */
const WakeupTimeForm: React.FC<WakeupTimeFormProps> = ({
    isConnected,
    wallet,
    walletAddress,
    wakeupTime,
    isLoading,
    onWakeupTimeChange,
    onFetchDepositInfo,
    onError,
    onStartLoading,
    onStopLoading
}) => {
    // 本地状态跟踪今天是否已经打卡
    const [hasCheckedIn, setHasCheckedIn] = useState(false);
    const [isLate, setIsLate] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const updateDepositInfoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 检查当前时间是否晚于7点
    useEffect(() => {
        const now = new Date();
        const hours = now.getHours();
        setIsLate(hours >= 7);

        // 检查本地存储，查看今天是否已经打卡
        const today = new Date().toISOString().split('T')[0];
        const lastCheckIn = localStorage.getItem('lastCheckInDate');

        if (lastCheckIn === today) {
            setHasCheckedIn(true);
        } else {
            setHasCheckedIn(false);
        }
    }, []);

    // 组件卸载时清理超时
    useEffect(() => {
        return () => {
            if (updateDepositInfoTimeoutRef.current) {
                clearTimeout(updateDepositInfoTimeoutRef.current);
            }
        };
    }, []);

    // 获取今天日期的格式化字符串
    const getTodayFormatted = useCallback(() => {
        const now = new Date();
        return now.toLocaleDateString('zh-CN');
    }, []);

    // 提交起床时间
    const handleSubmitWakeupTime = useCallback(async () => {
        if (!wallet || !isConnected) {
            onError('请先连接钱包');
            return;
        }

        // 防止重复提交
        if (isSubmitting || isLoading) return;
        setIsSubmitting(true);

        // 验证起床时间格式
        if (!wakeupTime.match(/^\d{2}:\d{2}$/)) {
            onError('请输入有效的起床时间格式 (HH:MM)');
            setIsSubmitting(false);
            return;
        }

        onStartLoading();

        try {
            // 将时间字符串转换为时间戳
            const [hours, minutes] = wakeupTime.split(':').map(Number);
            const now = new Date();
            now.setHours(hours, minutes, 0, 0);
            const timestamp = Math.floor(now.getTime() / 1000);

            // 获取钱包对象中的signAndExecuteTransactionBlock方法
            const hasSignMethod = (obj: unknown): obj is SigningWallet => {
                return obj !== null &&
                    typeof obj === 'object' &&
                    'signAndExecuteTransactionBlock' in obj &&
                    typeof (obj as SigningWallet).signAndExecuteTransactionBlock === 'function';
            };

            let walletWithSignMethod: SigningWallet | null = null;

            // 检查账户对象是否有签名方法
            if (wallet.accounts && wallet.accounts.length > 0 && hasSignMethod(wallet.accounts[0])) {
                walletWithSignMethod = wallet.accounts[0] as SigningWallet;
            }
            // 检查钱包对象本身是否有签名方法
            else if (hasSignMethod(wallet)) {
                walletWithSignMethod = wallet as unknown as SigningWallet;
            }

            if (!walletWithSignMethod) {
                console.error('无法找到钱包的签名方法');
                throw new Error('不支持的钱包类型，无法执行交易');
            }

            const tx = await submitWakeupTime(walletWithSignMethod, timestamp);

            if (tx.success) {
                // 更新本地存储，记录今天已打卡
                const today = new Date().toISOString().split('T')[0];
                localStorage.setItem('lastCheckInDate', today);
                setHasCheckedIn(true);

                // 在超时后刷新存款信息，使用ref跟踪超时
                if (updateDepositInfoTimeoutRef.current) {
                    clearTimeout(updateDepositInfoTimeoutRef.current);
                }

                updateDepositInfoTimeoutRef.current = setTimeout(() => {
                    if (walletAddress) {
                        onFetchDepositInfo(walletAddress);
                    }
                }, 3000);

                // 打卡成功的提示信息
                const lateMessage = isLate ? "\n由于已超过7点，将从押金中扣除0.1 SUI" : "\n恭喜！按时打卡没有扣款";
                alert(`起床时间提交成功！${lateMessage}`);
            } else {
                throw new Error('提交起床时间失败');
            }
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error);
            onError(errorMessage);
            console.error('提交起床时间失败:', errorMessage);
        } finally {
            setIsSubmitting(false);
            onStopLoading();
        }
    }, [wallet, isConnected, wakeupTime, isSubmitting, isLoading, isLate, walletAddress, onError, onFetchDepositInfo, onStartLoading, onStopLoading]);

    // 处理时间输入变化
    const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onWakeupTimeChange(e.target.value);
    }, [onWakeupTimeChange]);

    return (
        <div className="bg-base-200 p-6 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-bold">提交起床时间</h2>
                {isLate && (
                    <span className="badge badge-warning">已过7点</span>
                )}
            </div>

            {hasCheckedIn ? (
                <div className="alert alert-success mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="font-bold">今日已打卡!</h3>
                        <div className="text-xs">今天 ({getTodayFormatted()}) 您已成功记录起床时间</div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">起床时间 (7点后会扣除0.1 SUI)</span>
                        </label>
                        <input
                            type="time"
                            className="input input-bordered w-full"
                            value={wakeupTime}
                            onChange={handleTimeChange}
                            disabled={isLoading || isSubmitting}
                        />
                    </div>
                    <button
                        className="btn btn-primary btn-block mt-5 gap-2"
                        onClick={handleSubmitWakeupTime}
                        disabled={!isConnected || isLoading || isSubmitting || !wakeupTime}
                    >
                        {(isLoading || isSubmitting) ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                        {(isLoading || isSubmitting) ? '处理中...' : '提交起床时间'}
                    </button>

                    <div className={`alert ${isLate ? 'alert-error' : 'alert-warning'} mt-4 py-2`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs">
                            {isLate
                                ? "当前时间已超过7点，提交将扣除0.1 SUI！"
                                : "每日7点前打卡不扣款，7点后打卡将扣除0.1 SUI"
                            }
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};

export default WakeupTimeForm; 