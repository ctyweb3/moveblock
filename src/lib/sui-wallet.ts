import type { Wallet } from '@mysten/wallet-standard';

// 为navigator.wallets扩展类型声明
declare global {
    interface Navigator {
        wallets?: {
            get(): any[];
        };
    }
}

// 钱包状态
interface WalletState {
    isConnected: boolean;
    accounts: any[];
    currentAccount: any | null;
}

// 初始钱包状态
const initialState: WalletState = {
    isConnected: false,
    accounts: [],
    currentAccount: null,
};

// 等待钱包提供商初始化
export const waitForWalletProvider = async (timeout = 5000): Promise<boolean> => {
    // 检查是否已有钱包提供商
    if (typeof window !== 'undefined' && window.navigator.wallets) {
        return true;
    }

    return new Promise<boolean>((resolve) => {
        // 设置超时
        const timeoutId = setTimeout(() => {
            resolve(false);
        }, timeout);

        // 监听钱包提供商可用事件
        window.addEventListener('load', () => {
            if (window.navigator.wallets) {
                clearTimeout(timeoutId);
                resolve(true);
            }
        });

        // 检查DOM是否已加载完成
        if (document.readyState === 'complete') {
            if (window.navigator.wallets) {
                clearTimeout(timeoutId);
                resolve(true);
            } else {
                // 创建一个轮询来检查钱包提供商
                const checkInterval = setInterval(() => {
                    if (window.navigator.wallets) {
                        clearTimeout(timeoutId);
                        clearInterval(checkInterval);
                        resolve(true);
                    }
                }, 200);
            }
        }
    });
};

// 获取可用的钱包提供商
export const getWallets = (): any[] => {
    if (typeof window === 'undefined') return [];

    try {
        // 全局钱包提供商
        const walletProviders = window.navigator.wallets?.get() || [];
        return walletProviders;
    } catch (error) {
        console.error('获取钱包提供商失败:', error);
        return [];
    }
};

// 判断是否有可用的钱包
export const hasWallets = (): boolean => {
    return getWallets().length > 0;
};

// 连接钱包
export const connectWallet = async (walletName?: string) => {
    try {
        // 等待钱包提供商初始化
        const walletProviderReady = await waitForWalletProvider();
        if (!walletProviderReady) {
            throw new Error('钱包提供商初始化失败。请安装并启用Sui钱包扩展。');
        }

        const wallets = getWallets();

        if (!wallets.length) {
            throw new Error('没有找到支持的钱包。请安装Sui钱包扩展。');
        }

        let selectedWallet;

        if (walletName) {
            const foundWallet = wallets.find(wallet => wallet.name === walletName);
            if (!foundWallet) {
                throw new Error(`找不到名为 ${walletName} 的钱包`);
            }
            selectedWallet = foundWallet;
        } else {
            // 默认使用第一个钱包
            selectedWallet = wallets[0];
        }

        // 尝试连接钱包
        if (selectedWallet.features['standard:connect']) {
            // @ts-ignore 类型兼容问题
            await selectedWallet.features['standard:connect'].connect();
        }

        const accounts = selectedWallet.accounts;

        if (!accounts.length) {
            throw new Error('钱包中没有账户');
        }

        return {
            success: true,
            wallet: selectedWallet,
            accounts,
            currentAccount: accounts[0],
        };
    } catch (error) {
        console.error('连接钱包失败:', error);
        return { success: false, error };
    }
};

// 从钱包断开连接
export const disconnectWallet = async (wallet: any) => {
    try {
        if (wallet && wallet.features['standard:disconnect']) {
            // @ts-ignore 类型兼容问题
            await wallet.features['standard:disconnect'].disconnect();
        }
        return { success: true };
    } catch (error) {
        console.error('断开钱包连接失败:', error);
        return { success: false, error };
    }
};

// 简化的交易执行接口
export type SimpleTransactionInput = {
    transaction: any;
    account?: any;
    chain?: string;
};

// 简化签名并执行交易方法
export const executeTransaction = async (wallet: any, input: SimpleTransactionInput) => {
    try {
        if (!input.account && wallet.accounts.length > 0) {
            input.account = wallet.accounts[0];
        }

        if (!input.chain) {
            input.chain = 'sui:testnet'; // 默认使用testnet
        }

        // 使用钱包的交易执行功能
        const result = await wallet.features['sui:signAndExecuteTransaction'].signAndExecuteTransaction(input);
        return { success: true, result };
    } catch (error) {
        console.error('交易签名并执行失败:', error);
        return { success: false, error };
    }
}; 