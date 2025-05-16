/**
 * Sui钱包类型定义
 * 
 * 这个文件包含与Sui钱包相关的接口定义和类型。
 * 实际的钱包连接逻辑已经迁移到使用官方的@mysten/dapp-kit库。
 * 
 * @see WalletConnector 组件用于钱包连接UI
 */

// 扩展Window接口
declare global {
    interface Window {
        suiWallet?: unknown;
    }
}

// 钱包账户类型
export interface WalletAccount {
    address: string;
    publicKey: Uint8Array;
    chains: string[];
    features: string[];
}

// 简化的交易执行接口
export interface SimpleTransactionInput {
    transaction: unknown;
    account?: WalletAccount;
    chain?: string;
}

// 执行交易结果类型
export interface ExecuteTransactionResult {
    success: boolean;
    result?: unknown;
    error?: unknown;
}

/**
 * 检查是否有可用的Sui钱包
 * @returns {boolean} 是否有钱包可用
 */
export function hasWallets(): boolean {
    // 注意：useWallets是一个React hook，不能在非React组件中直接调用
    // 因此这里我们使用一个简化的方法来检查window对象上是否有钱包
    return typeof window !== 'undefined' &&
        (window.hasOwnProperty('suiWallet') ||
            !!window.localStorage.getItem('wallet-standard:last-wallet-used'));
}

/**
 * 等待钱包提供程序初始化
 * @param {number} timeout 超时时间(毫秒)
 * @returns {Promise<void>}
 */
export function waitForWalletProvider(timeout: number = 3000): Promise<void> {
    return new Promise((resolve) => {
        // 检查是否已经有钱包可用
        if (hasWallets()) {
            resolve();
            return;
        }

        // 设置超时
        const timeoutId = setTimeout(() => {
            resolve();
        }, timeout);

        // 定期检查钱包是否可用
        const checkInterval = setInterval(() => {
            if (hasWallets()) {
                clearTimeout(timeoutId);
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
    });
}