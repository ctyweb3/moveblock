"use client";

import { useState, useEffect, useRef } from "react";

// 为AudioContext定义接口，避免使用any
interface AudioContextType {
    createOscillator: () => OscillatorNode;
    destination: AudioNode;
    currentTime: number;
}

// 全局声明AudioContext
declare global {
    interface Window {
        AudioContext: {
            new(): AudioContextType;
        };
        webkitAudioContext: {
            new(): AudioContextType;
        };
    }
}

export default function Alarm() {
    const [time, setTime] = useState<string>("00:00");
    // 将闹钟时间固定为07:00（早上7点）
    const [alarmTime] = useState<string>("07:00");
    const [isAlarmSet, setIsAlarmSet] = useState<boolean>(true); // 默认已设置
    const [isRinging, setIsRinging] = useState<boolean>(false);
    const [hasTriggered, setHasTriggered] = useState<boolean>(false);
    const [audioStatus, setAudioStatus] = useState<string>("");
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 触发闹钟
    const triggerAlarm = () => {
        setIsRinging(true);
        playAudio();
    };

    // 初始化音频
    useEffect(() => {
        // 创建一个全局音频元素，而不是依赖于JSX中的音频元素
        const audio = new Audio("/alarm-sound.mp3");
        audio.loop = true;
        audio.preload = "auto";
        audioRef.current = audio;

        // 添加音频事件监听
        audio.addEventListener("play", () => {
            console.log("音频开始播放");
            setAudioStatus("播放中");
        });

        audio.addEventListener("error", (e) => {
            console.error("音频错误:", e);
            setAudioStatus("播放错误");
        });

        console.log("闹钟已设置在早上7:00");

        // 组件卸载时清理
        return () => {
            audio.pause();
            audio.src = "";
        };
    }, []);

    // 更新当前时间
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            setTime(`${hours}:${minutes}`);

            // 检查是否到了闹钟时间
            const currentTimeStr = `${hours}:${minutes}`;

            // 调试信息
            if (isAlarmSet) {
                console.log(`当前时间: ${currentTimeStr}, 闹钟时间: ${alarmTime}, 已触发: ${hasTriggered}`);
            }

            if (isAlarmSet && currentTimeStr === alarmTime && !hasTriggered) {
                console.log("触发闹钟!");
                triggerAlarm();
                setHasTriggered(true); // 标记已触发，避免重复触发
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isAlarmSet, alarmTime, hasTriggered, triggerAlarm]);

    // 播放音频
    const playAudio = () => {
        if (!audioRef.current) {
            setAudioStatus("音频元素未找到");
            console.error("音频元素未找到");
            return;
        }

        try {
            // 确保音频是从头开始播放的
            audioRef.current.currentTime = 0;

            // 设置音量
            audioRef.current.volume = 1.0;

            // 显式加载
            audioRef.current.load();

            // 播放音频并处理结果
            const playPromise = audioRef.current.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log("音频成功播放");
                        setAudioStatus("播放成功");
                    })
                    .catch(error => {
                        console.error("音频播放失败:", error);
                        setAudioStatus(`播放失败: ${error.message}`);

                        // 尝试通过 Web Audio API 播放
                        playFallbackAudio();
                    });
            }
        } catch (error) {
            console.error("音频播放出错:", error);
            setAudioStatus(`播放异常: ${error}`);
            playFallbackAudio();
        }
    };

    // 替代方案播放音频
    const playFallbackAudio = () => {
        try {
            // 使用类型定义代替any
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 440 Hz = A4 音符

            oscillator.connect(audioContext.destination);
            oscillator.start();

            // 播放1秒
            setTimeout(() => {
                oscillator.stop();
            }, 1000);

            setAudioStatus("使用Web Audio API播放");
        } catch (error) {
            console.error("Web Audio API 播放失败:", error);
            setAudioStatus(`备用播放失败: ${error}`);

            // 最后手段：使用浏览器alert
            alert("闹钟时间到了!");
        }
    };

    // 停止闹钟
    const stopAlarm = () => {
        setIsRinging(false);
        setHasTriggered(false); // 重置触发状态，允许下次触发
        setAudioStatus("已停止");

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    // 启用/禁用闹钟
    const toggleAlarm = () => {
        setIsAlarmSet(!isAlarmSet);
        setHasTriggered(false);
        if (!isAlarmSet) {
            console.log("闹钟已启用 - 设置在早上7:00");
        } else {
            console.log("闹钟已禁用");
            stopAlarm();
        }
    };

    // 测试音频
    const testAudio = () => {
        setAudioStatus("正在测试音频...");
        playAudio();

        // 播放3秒后停止测试
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setAudioStatus("测试完成");
            }
        }, 3000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">简易闹钟</h1>

                {/* 当前时间显示 */}
                <div className="text-5xl font-mono text-center mb-8">{time}</div>

                {/* 固定闹钟时间显示 */}
                <div className="mb-6 text-center">
                    <div className="text-xl font-medium mb-2">闹钟设置</div>
                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold mb-2">早上 7:00</div>
                        <div className="mt-2">
                            <button
                                className={`px-4 py-2 ${isAlarmSet ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                                onClick={toggleAlarm}
                            >
                                {isAlarmSet ? '禁用闹钟' : '启用闹钟'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 闹钟状态 */}
                {isAlarmSet && (
                    <div className="text-center mb-4 bg-green-100 p-3 rounded-md">
                        <p className="text-green-800">
                            闹钟已设置在 <span className="font-bold">早上7:00</span>
                        </p>
                    </div>
                )}

                {/* 闹钟响铃时的界面 */}
                {isRinging && (
                    <div className="mt-6 p-4 bg-red-100 rounded-lg animate-pulse">
                        <h2 className="text-xl font-bold text-center text-red-600 mb-2">时间到了!</h2>
                        <button
                            className="w-full px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                            onClick={stopAlarm}
                        >
                            停止闹钟
                        </button>
                    </div>
                )}

                {/* 测试按钮 */}
                <div className="mt-8">
                    <button
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        onClick={testAudio}
                    >
                        测试闹钟声音
                    </button>

                    {/* 音频状态显示 */}
                    {audioStatus && (
                        <div className="mt-2 text-xs text-center text-gray-500">
                            音频状态: {audioStatus}
                        </div>
                    )}
                </div>

                {/* 备用下载链接 */}
                <div className="mt-4 text-center text-xs text-gray-500">
                    <p>如果听不到声音，<a href="/alarm-sound.mp3" download className="text-blue-600 underline">点此下载铃声</a>查看是否能播放</p>
                </div>
            </div>
        </div>
    );
} 