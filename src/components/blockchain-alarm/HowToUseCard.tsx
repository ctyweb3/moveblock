import React from 'react';

/**
 * 区块链闹钟使用说明卡片组件
 */
const HowToUseCard: React.FC = () => {
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title text-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    如何使用
                </h2>
                <ol className="steps steps-vertical md:steps-horizontal">
                    <li className="step step-primary">存入 SUI 代币</li>
                    <li className="step step-primary">每天提交起床时间</li>
                    <li className="step step-primary">7点前起床无扣款</li>
                    <li className="step step-primary">21天后取回剩余存款</li>
                </ol>
            </div>
        </div>
    );
};

export default HowToUseCard; 