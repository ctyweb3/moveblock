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
            // 这里可以根据实际数据结构进行更精确的解析
            const formattedData = {
                存款金额: info.amount ? `${info.amount} SUI` : "未知",
                开始日期: info.startDate ? new Date(info.startDate * 1000).toLocaleDateString('zh-CN') : "未知",
                结束日期: info.endDate ? new Date(info.endDate * 1000).toLocaleDateString('zh-CN') : "未知",
                已打卡天数: info.checkIns || 0,
                剩余天数: info.daysLeft || "未知",
                状态: info.status || "进行中"
            };
            return formattedData;
        } catch (error) {
            console.error("解析存款信息失败", error);
            return null;
        }
    };

    const formattedInfo = formatData(depositInfo);

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex items-center gap-3 mb-5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="text-xl font-bold">存款信息</h2>
                </div>

                {formattedInfo ? (
                    <div className="stats stats-vertical lg:stats-horizontal shadow w-full">
                        {Object.entries(formattedInfo).map(([key, value]) => (
                            <div className="stat" key={key}>
                                <div className="stat-title">{key}</div>
                                <div className="stat-value text-lg">{value}</div>
                            </div>
                        ))}
                    </div>
                ) : null}

                {/* 总是显示原始数据 */}
                <div className="mt-4">
                    <div className="font-medium mb-2">原始区块链数据:</div>
                    <div className="bg-base-300 p-4 rounded overflow-x-auto">
                        <pre className="font-mono text-sm">
                            {JSON.stringify(depositInfo.rawData, null, 2)}
                        </pre>
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