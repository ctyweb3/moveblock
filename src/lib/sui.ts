import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFaucetHost, requestSuiFromFaucetV1 } from '@mysten/sui/faucet';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';
import { bcs } from '@mysten/sui/bcs';

// 智能合约地址
const CONTRACT_ADDRESS = '0xba1e0a3b235d591e338cca68b226a8bff51010041391e1b478df41776daf7066';

// 创建Sui客户端 - 默认使用测试网，可以根据需要修改
export const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

// SUI代币单位转换
export const mistToSui = (balance: string) => {
    return Number.parseInt(balance) / Number(MIST_PER_SUI);
};

export const suiToMist = (balance: number) => {
    return Math.floor(balance * Number(MIST_PER_SUI)).toString();
};

// 获取账户余额
export const getBalance = async (address: string) => {
    try {
        const balance = await suiClient.getBalance({
            owner: address,
        });
        return {
            totalBalance: mistToSui(balance.totalBalance),
            success: true,
        };
    } catch (error) {
        console.error('获取余额失败:', error);
        return {
            totalBalance: 0,
            success: false,
            error,
        };
    }
};

// 从水龙头获取测试代币（仅适用于测试网/开发网）
export const requestSuiFromFaucet = async (address: string) => {
    try {
        await requestSuiFromFaucetV1({
            host: getFaucetHost('testnet'),
            recipient: address,
        });
        return { success: true };
    } catch (error) {
        console.error('从水龙头获取SUI失败:', error);
        return { success: false, error };
    }
};

// 用户存款功能 - 至少2.1 SUI
export const depositToContract = async (
    signer: any, // Wallet适配器的签名者
    amount: number // SUI数量
) => {
    try {
        // 验证金额是否满足最低要求
        if (amount < 2.1) {
            throw new Error('存款金额必须至少为2.1 SUI');
        }

        const tx = new Transaction();
        const amountInMist = suiToMist(amount);

        // 创建一个带有指定金额的代币
        const [coin] = tx.splitCoins(tx.gas, [amountInMist]);

        // 调用合约的deposit函数
        tx.moveCall({
            target: `${CONTRACT_ADDRESS}::early_bird::deposit`,
            arguments: [coin],
        });

        // 执行交易
        const result = await suiClient.signAndExecuteTransaction({
            signer,
            transaction: tx,
        });

        return { success: true, txId: result.digest };
    } catch (error) {
        console.error('存款失败:', error);
        return { success: false, error };
    }
};

// 提交起床时间
export const submitWakeupTime = async (
    signer: any, // Wallet适配器的签名者
    timestamp: number // 起床时间的时间戳
) => {
    try {
        const tx = new Transaction();

        // 调用合约的record_wakeup_time函数
        tx.moveCall({
            target: `${CONTRACT_ADDRESS}::early_bird::record_wakeup_time`,
            arguments: [tx.pure.u64(timestamp)], // 使用u64类型正确序列化时间戳
        });

        // 执行交易
        const result = await suiClient.signAndExecuteTransaction({
            signer,
            transaction: tx,
        });

        return { success: true, txId: result.digest };
    } catch (error) {
        console.error('提交起床时间失败:', error);
        return { success: false, error };
    }
};

// 获取用户存款信息
export const getUserDepositInfo = async (userAddress: string) => {
    try {
        // 创建用于查询的交易
        const tx = new Transaction();

        // 调用合约的get_user_deposit函数
        tx.moveCall({
            target: `${CONTRACT_ADDRESS}::early_bird::get_user_deposit`,
            arguments: [],
        });

        // 使用devInspectTransactionBlock查询
        const result = await suiClient.devInspectTransactionBlock({
            sender: userAddress,
            transactionBlock: tx,
        });

        // 解析结果
        if (result && result.effects?.status?.status === 'success') {
            // 需要根据实际合约返回结构解析
            return {
                success: true,
                data: result.results?.[0]?.returnValues
            };
        }

        return { success: false, error: '获取用户存款信息失败' };
    } catch (error) {
        console.error('获取用户存款信息失败:', error);
        return { success: false, error };
    }
};

// 提取存款
export const withdrawDeposit = async (signer: any) => {
    try {
        const tx = new Transaction();

        // 调用合约的withdraw函数
        tx.moveCall({
            target: `${CONTRACT_ADDRESS}::early_bird::withdraw`,
            arguments: [],
        });

        // 执行交易
        const result = await suiClient.signAndExecuteTransaction({
            signer,
            transaction: tx,
        });

        return { success: true, txId: result.digest };
    } catch (error) {
        console.error('提取存款失败:', error);
        return { success: false, error };
    }
}; 