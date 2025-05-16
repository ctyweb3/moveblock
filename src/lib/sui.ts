import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { getFaucetHost, requestSuiFromFaucetV1 } from '@mysten/sui/faucet';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';

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
    signer: unknown, // 临时使用unknown类型避开类型检查
    amount: number // SUI数量
) => {
    try {
        // 验证金额是否满足最低要求
        if (amount < 2.1) {
            throw new Error('存款金额必须至少为2.1 SUI');
        }

        console.log('开始存款流程，金额:', amount, 'SUI');
        console.log('签名者对象:', signer);

        // 检查signer是否具有必要的方法
        if (!signer || typeof signer !== 'object') {
            console.error('无效的钱包签名者对象');
            throw new Error('无效的钱包对象，请重新连接钱包');
        }

        const tx = new Transaction();
        const amountInMist = suiToMist(amount);
        console.log('转换后的MIST金额:', amountInMist);

        try {
            // 创建一个带有指定金额的代币
            const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
            console.log('已成功拆分代币');

            // 调用合约的deposit函数
            tx.moveCall({
                target: `${CONTRACT_ADDRESS}::early_bird::deposit`,
                arguments: [coin],
            });
            console.log('已准备合约调用');

            // 获取序列化的交易
            const txBytes = await tx.build({ client: suiClient });
            console.log('交易已构建，准备执行');

            // 执行交易，使用类型断言，增加了错误处理
            try {
                // 优先尝试使用标准接口签名
                if (typeof (signer as any).signAndExecuteTransactionBlock === 'function') {
                    console.log('使用钱包的signAndExecuteTransactionBlock方法');
                    const result = await (signer as any).signAndExecuteTransactionBlock({
                        transactionBlock: txBytes,
                    });
                    console.log('交易执行成功:', result);
                    return { success: true, txId: result.digest };
                }
                // 使用客户端的签名方法（兼容不同钱包实现）
                else {
                    console.log('使用SuiClient的signAndExecuteTransaction方法');
                    const result = await suiClient.signAndExecuteTransaction({
                        signer: signer as any,
                        transaction: tx,
                    });
                    console.log('交易执行成功:', result);
                    return { success: true, txId: result.digest };
                }
            } catch (signError) {
                console.error('签名执行交易失败:', signError);
                // 捕获特定类型的错误并提供更友好的错误信息
                if (String(signError).includes('insufficient balance')) {
                    throw new Error('余额不足，无法完成存款');
                } else if (String(signError).includes('user reject')) {
                    throw new Error('用户拒绝了交易请求');
                } else {
                    throw signError; // 重新抛出原始错误
                }
            }
        } catch (txError) {
            console.error('准备交易时出错:', txError);
            throw txError;
        }
    } catch (error) {
        console.error('存款失败:', error);
        return {
            success: false,
            error,
            errorMessage: getErrorMessage(error)
        };
    }
};

// 辅助函数：从错误对象中提取消息
const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    return String(error);
};

// 提交起床时间
export const submitWakeupTime = async (
    signer: unknown, // 临时使用unknown类型避开类型检查
    timestamp: number // 起床时间的时间戳
) => {
    try {
        const tx = new Transaction();

        // 调用合约的record_wakeup_time函数
        tx.moveCall({
            target: `${CONTRACT_ADDRESS}::early_bird::record_wakeup_time`,
            arguments: [tx.pure.u64(timestamp)], // 使用u64类型正确序列化时间戳
        });

        // 执行交易，使用类型断言
        const result = await suiClient.signAndExecuteTransaction({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            signer: signer as any, // 类型断言为any，避免类型错误
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
export const withdrawDeposit = async (signer: unknown) => {
    try {
        const tx = new Transaction();

        // 调用合约的withdraw函数
        tx.moveCall({
            target: `${CONTRACT_ADDRESS}::early_bird::withdraw`,
            arguments: [],
        });

        // 执行交易，使用类型断言
        const result = await suiClient.signAndExecuteTransaction({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            signer: signer as any, // 类型断言为any，避免类型错误
            transaction: tx,
        });

        return { success: true, txId: result.digest };
    } catch (error) {
        console.error('提取存款失败:', error);
        return { success: false, error };
    }
}; 