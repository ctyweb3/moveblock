import React, { useState, useEffect } from 'react';

interface ErrorAlertProps {
    error: string | null;
}

/**
 * 错误提示组件 - 显示操作错误信息
 */
const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
    const [visible, setVisible] = useState(false);

    // 当error变化时控制显示效果
    useEffect(() => {
        if (error) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [error]);

    if (!error) return null;

    return (
        <div className={`fixed bottom-5 right-5 transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="alert alert-error shadow-lg max-w-md">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="font-bold">错误</h3>
                        <div className="text-sm">{error}</div>
                    </div>
                </div>
                <div className="flex-none">
                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => setVisible(false)}
                    >
                        关闭
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorAlert; 