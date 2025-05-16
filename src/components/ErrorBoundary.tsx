"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

// 抑制特定控制台错误的类型
interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

/**
 * 错误边界组件 - 用于捕获和处理子组件中的错误
 * 这有助于防止整个应用崩溃
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    // 当子组件抛出错误时，这个生命周期方法会被调用
    static getDerivedStateFromError(): ErrorBoundaryState {
        // 当捕获到错误时，更新状态使下一次渲染能够显示回退UI
        return { hasError: true };
    }

    // 当捕获到错误时，这个方法可以记录错误信息
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // 过滤掉特定的错误警告
        if (error.message && error.message.includes('Dialog is changing from uncontrolled to controlled')) {
            // 不输出此类警告
            return;
        }

        console.error('组件错误:', error);
        console.error('错误信息:', errorInfo);
    }

    // 重写控制台的错误方法，过滤掉特定警告
    componentDidMount() {
        if (typeof window !== 'undefined') {
            const originalConsoleError = console.error;

            console.error = (...args: unknown[]) => {
                // 过滤掉特定的警告
                const suppressedWarnings = [
                    'Dialog is changing from uncontrolled to controlled',
                    'Components should not switch from controlled to uncontrolled'
                ];

                // 添加类型检查
                const firstArg = args[0];
                if (
                    typeof firstArg === 'string' &&
                    suppressedWarnings.some(warning => firstArg.includes(warning))
                ) {
                    return;
                }

                originalConsoleError(...args);
            };

            // 保存原始方法以便在卸载时恢复
            this.originalConsoleError = originalConsoleError;
        }
    }

    // 恢复原始的控制台方法
    componentWillUnmount() {
        if (typeof window !== 'undefined' && this.originalConsoleError) {
            console.error = this.originalConsoleError;
        }
    }

    // 添加一个私有属性来保存原始控制台方法
    private originalConsoleError: typeof console.error | undefined;

    render() {
        if (this.state.hasError) {
            // 如果捕获到错误，显示一个友好的回退UI
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="text-lg font-medium text-red-800">组件加载错误</h3>
                    <p className="mt-2 text-sm text-red-700">
                        应用的某部分遇到了问题。请尝试刷新页面。
                    </p>
                </div>
            );
        }

        // 正常情况下，渲染子组件
        return this.props.children;
    }
}

export default ErrorBoundary; 