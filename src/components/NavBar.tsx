"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
    const pathname = usePathname();

    // 判断当前路径是否激活
    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 text-xl font-bold text-blue-600">
                            闹钟应用
                        </Link>
                    </div>
                    <div className="flex space-x-4">
                        <Link
                            href="/"
                            className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/")
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                        >
                            首页
                        </Link>
                        <Link
                            href="/alarm"
                            className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/alarm")
                                ? "bg-blue-600 text-white"
                                : "text-gray-700 hover:bg-blue-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                        >
                            闹钟
                        </Link>
                        <Link
                            href="/blockchain-alarm"
                            className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/blockchain-alarm")
                                ? "bg-purple-600 text-white"
                                : "text-gray-700 hover:bg-purple-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                }`}
                        >
                            区块链早起闹钟
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
} 