import React from 'react';
import { DepositInfoType } from './types';

interface DepositInfoProps {
    depositInfo: DepositInfoType;
}

/**
 * 存款信息组件 - 展示用户的存款相关信息
 */
const DepositInfo: React.FC<DepositInfoProps> = ({ depositInfo }) => {
    if (!depositInfo) return null;

    // 解析存款信息中的关键数据
    const formatData = (info: DepositInfoType) => {
        try {
            const totalDays = 21; // 总共需要21天
            const completedDays = info.checkIns || 0;
            const completionPercentage = Math.min(100, Math.round((completedDays / totalDays) * 100));

            // 格式化数据
            const formattedData = {
                存款金额: info.amount ? `${info.amount.toFixed(2)} SUI` : "未知",
                开始日期: info.startDate ? new Date(info.startDate * 1000).toLocaleDateString('zh-CN') : "未知",
                结束日期: info.endDate ? new Date(info.endDate * 1000).toLocaleDateString('zh-CN') : "未知",
                已打卡天数: `${completedDays}/${totalDays}天`,
                剩余天数: typeof info.daysLeft === 'number' ? `${info.daysLeft}天` : "未知",
                状态: info.status || "进行中",
                completionPercentage
            };
            return formattedData;
        } catch (error) {
            console.error("解析存款信息失败", error);
            return null;
        }
    };

    const formattedInfo = formatData(depositInfo);
    if (!formattedInfo) return null;

    // 状态颜色
    const getStatusColor = (status: string) => {
        switch (status) {
            case '已完成': return 'text-success';
            case '进行中': return 'text-info';
            default: return 'text-warning';
        }
    };

    // 进度条颜色
    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return 'progress-success';
        if (percentage >= 50) return 'progress-info';
        if (percentage >= 20) return 'progress-warning';
        return 'progress-error';
    };

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex items-center gap-3 mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="text-xl font-bold">存款信息</h2>
                    <span className={`badge ${getStatusColor(formattedInfo.状态)} gap-1`}>
                        {formattedInfo.状态 === '已完成' && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {formattedInfo.状态}
                    </span>
                </div>

                {/* 金额和日期统计 */}
                <div className="stats shadow w-full mb-4">
                    <div className="stat">
                        <div className="stat-title">存款金额</div>
                        <div className="stat-value text-success text-xl">{formattedInfo.存款金额}</div>
                        <div className="stat-desc">锁定中</div>
                    </div>

                    <div className="stat">
                        <div className="stat-title">剩余天数</div>
                        <div className="stat-value text-xl">{formattedInfo.剩余天数}</div>
                        <div className="stat-desc">总共21天</div>
                    </div>

                    <div className="stat">
                        <div className="stat-title">已打卡天数</div>
                        <div className="stat-value text-xl">{formattedInfo.已打卡天数}</div>
                        <div className="stat-desc">每日打卡</div>
                    </div>
                </div>

                {/* 时间线和进度 */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{formattedInfo.开始日期}</span>
                        <span>{formattedInfo.结束日期}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className={`progress ${getProgressColor(formattedInfo.completionPercentage)} h-3 flex-1`}>
                            <div className="progress-bar" style={{ width: `${formattedInfo.completionPercentage}%` }}></div>
                        </div>
                        <span className="font-medium text-sm">{formattedInfo.completionPercentage}%</span>
                    </div>
                </div>

                {/* 提示信息 */}
                <div className="alert alert-info shadow-lg mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="font-bold">提示!</h3>
                        <div className="text-xs">每日7点前打卡不扣款，完成21天可全额提取存款。</div>
                    </div>
                </div>

                {/* 原始数据可折叠显示 */}
                <div className="collapse collapse-arrow mt-4">
                    <input type="checkbox" />
                    <div className="collapse-title font-medium">
                        原始区块链数据
                    </div>
                    <div className="collapse-content">
                        <div className="bg-base-300 p-4 rounded overflow-x-auto">
                            <pre className="font-mono text-sm">
                                {JSON.stringify(depositInfo.rawData, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>

                <div className="card-actions justify-end mt-4">
                    <div className="badge badge-outline badge-primary">链上数据</div>
                    <div className="badge badge-outline">智能合约</div>
                </div>
            </div>
        </div>
    );
};

export default DepositInfo; 