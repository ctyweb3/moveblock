"use client";

import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';

// 创建一个 QueryClient 实例
const queryClient = new QueryClient();

// 网络配置
const networks = {
    testnet: { url: 'https://fullnode.testnet.sui.io:443' },
    mainnet: { url: 'https://fullnode.mainnet.sui.io:443' },
    devnet: { url: 'https://fullnode.devnet.sui.io:443' },
};

// 默认网络
const defaultNetwork = 'testnet';

export default function Providers({ children }: { children: ReactNode }) {
    useEffect(() => {
        // 添加调试信息
        console.log('Providers 组件已加载');
        console.log('配置的网络:', networks);
        console.log('默认网络:', defaultNetwork);

        // 检查全局钱包对象
        const checkWallets = () => {
            if (typeof window !== 'undefined') {
                console.log('Window 对象上的钱包相关属性:');
                // 检查常见的钱包属性
                ['suiWallet', 'ethereum', 'walletStandard'].forEach(prop => {
                    console.log(`${prop} 存在:`, window.hasOwnProperty(prop));
                });
            }
        };

        // 延迟检查钱包，给钱包扩展时间加载
        setTimeout(checkWallets, 2000);
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networks} defaultNetwork={defaultNetwork}>
                <WalletProvider
                    autoConnect={false}
                    preferredWallets={[]}
                >
                    {children}
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    );
} 