import React from 'react';

/**
 * 区块链闹钟页面标题组件
 */
const BlockchainAlarmHeader: React.FC = () => {
    return (
        <div className="text-center mb-12">
            <div className="inline-block p-3 rounded-full bg-primary bg-opacity-10 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h1 className="text-4xl font-bold text-base-content mb-3">区块链早起闹钟</h1>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
                使用 SUI 区块链技术激励早起习惯，助您养成健康生活方式
            </p>
        </div>
    );
};

export default BlockchainAlarmHeader; 