import React from 'react';
import { submitWakeupTime } from '@/lib/sui';
import { getErrorMessage } from '@/lib/error-utils';
import { WalletType } from './types';

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
    // 提交起床时间
    const handleSubmitWakeupTime = async () => {
        if (!wallet || !isConnected) {
            onError('请先连接钱包');
            return;
        }

        onStartLoading();

        try {
            // 将时间字符串转换为时间戳
            const [hours, minutes] = wakeupTime.split(':').map(Number);
            const now = new Date();
            now.setHours(hours, minutes, 0, 0);
            const timestamp = Math.floor(now.getTime() / 1000);

            const tx = await submitWakeupTime(wallet, timestamp);

            if (tx.success) {
                // 刷新存款信息
                onFetchDepositInfo(walletAddress);

                alert('起床时间提交成功！');
            } else {
                throw new Error('提交起床时间失败');
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-xl font-bold">提交起床时间</h2>
            </div>
            <div className="form-control">
                <label className="label">
                    <span className="label-text">起床时间 (7点后会扣除0.1 SUI)</span>
                </label>
                <input
                    type="time"
                    className="input input-bordered w-full"
                    value={wakeupTime}
                    onChange={(e) => onWakeupTimeChange(e.target.value)}
                />
            </div>
            <button
                className="btn btn-primary btn-block mt-5 gap-2"
                onClick={handleSubmitWakeupTime}
                disabled={!isConnected || isLoading}
            >
                {isLoading ? (
                    <span className="loading loading-spinner"></span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                )}
                {isLoading ? '处理中...' : '提交起床时间'}
            </button>
            <div className="alert alert-warning mt-4 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs">每日7点前打卡不扣款，7点后打卡将扣除0.1 SUI</span>
            </div>
        </div>
    );
};

export default WakeupTimeForm; 