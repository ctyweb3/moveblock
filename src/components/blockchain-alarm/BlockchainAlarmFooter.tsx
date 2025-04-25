import React from 'react';

/**
 * 区块链闹钟页脚组件
 */
const BlockchainAlarmFooter: React.FC = () => {
    return (
        <footer className="text-center text-base-content/60 text-sm mt-16 pt-8 border-t border-base-300">
            <p>基于 Sui 区块链的早起激励应用 &copy; {new Date().getFullYear()}</p>
            <p className="mt-2">通过智能合约促进健康生活习惯</p>
        </footer>
    );
};

export default BlockchainAlarmFooter; 