import Link from 'next/link';

/**
 * 钱包安装指南组件
 * 当用户未安装钱包插件时，显示安装指南
 */
const WalletInstallGuide = () => {
    return (
        <div className="card bg-base-100 shadow-xl my-6">
            <div className="card-body">
                <h2 className="card-title text-xl text-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-warning mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    未检测到钱包插件
                </h2>

                <div className="alert alert-warning mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>请安装 Sui 钱包插件以使用本应用</span>
                </div>

                <div className="divider">安装步骤</div>

                <ol className="list-decimal list-inside space-y-3 ml-2 mb-6">
                    <li className="font-medium">
                        如果您尚未安装 Chrome 浏览器，请先
                        <Link href="https://www.google.com/chrome/" target="_blank" className="link link-primary ml-1">
                            下载并安装 Chrome 浏览器
                        </Link>
                    </li>
                    <li className="font-medium">
                        访问 Chrome 网上应用店，安装 Sui 钱包插件
                    </li>
                    <li className="font-medium">
                        安装后，按照钱包引导设置您的 Sui 钱包
                    </li>
                    <li className="font-medium">
                        刷新本页面，即可连接钱包使用本应用
                    </li>
                </ol>

                <div className="card-actions justify-center">
                    <Link
                        href="https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil"
                        target="_blank"
                        className="btn btn-primary btn-lg gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        获取 Sui 钱包插件
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default WalletInstallGuide; 