import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { ConnectButton } from '@mysten/dapp-kit';

/**
 * 钱包连接组件
 * 显示连接按钮和当前连接的钱包信息
 */
export function WalletConnector() {
    const account = useCurrentAccount();

    return (
        <div className="wallet-connector">
            <ConnectButton />
            {account && (
                <div className="account-info">
                    <p>当前链: {account.chains[0]}</p>
                    {/* 可以添加其他自定义信息 */}
                </div>
            )}
        </div>
    );
} 