// 错误类型接口
export interface ErrorWithMessage {
    message: string;
}

// 检查对象是否有message属性
export function hasMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
    );
}

// 从任何错误对象中获取错误消息
export function getErrorMessage(error: unknown): string {
    if (hasMessage(error)) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return '发生未知错误';
} 