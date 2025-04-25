import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col gap-8 items-center">
        <h1 className="text-4xl font-bold text-center">简易闹钟应用</h1>
        <p className="text-lg text-center max-w-md">这是一个简单的闹钟应用，可以帮助您设置提醒时间</p>

        <div className="flex gap-4 mt-8">
          <Link
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium flex items-center gap-2 shadow-lg transition-all hover:shadow-xl"
            href="/alarm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            进入闹钟应用
          </Link>

          <Link
            className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-medium flex items-center gap-2 shadow-lg transition-all hover:shadow-xl"
            href="/blockchain-alarm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            区块链早起闹钟
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">设置闹钟</h2>
            <p className="text-gray-600 dark:text-gray-300">简单设置您需要的闹钟时间</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">提醒功能</h2>
            <p className="text-gray-600 dark:text-gray-300">到点后自动发出提醒音</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="text-purple-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">区块链支持</h2>
            <p className="text-gray-600 dark:text-gray-300">基于Sui区块链的早起打卡激励机制</p>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>© 2023 简易闹钟应用 | 使用 Next.js 和 Tailwind CSS 构建</p>
      </footer>
    </div>
  );
}
