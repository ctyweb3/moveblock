"use client";

import { ConnectButton } from '@mysten/dapp-kit';
import { useEffect, useRef } from 'react';

/**
 * 自定义连接按钮组件 - 解决点击问题
 * 注意：此组件应该仅在客户端使用，不应该在服务器端渲染
 */
const CustomConnectButton = () => {
    const buttonRef = useRef<HTMLDivElement>(null);

    // 组件挂载后修复可能的点击问题
    useEffect(() => {
        const fixButtonStyles = () => {
            if (buttonRef.current) {
                const buttonElement = buttonRef.current.querySelector('button');
                if (buttonElement) {
                    // 确保按钮可点击
                    buttonElement.style.pointerEvents = 'auto';
                    buttonElement.style.cursor = 'pointer';
                    buttonElement.style.position = 'relative';
                    buttonElement.style.zIndex = '50';
                }
            }
        };

        // 初始时以及间隔执行，确保在动态加载时也能应用样式
        fixButtonStyles();
        const styleInterval = setInterval(fixButtonStyles, 1000);

        return () => {
            clearInterval(styleInterval);
        };
    }, []);

    return (
        <div
            ref={buttonRef}
            className="custom-connect-btn-wrapper relative z-20"
            style={{
                display: 'inline-block',
                position: 'relative'
            }}
        >
            <ConnectButton />
        </div>
    );
};

export default CustomConnectButton; 