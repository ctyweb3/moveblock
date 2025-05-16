import React from 'react';
import { WalletConnector } from './components/WalletConnector';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>MoveBlock应用</h1>
                <WalletConnector />
            </header>
            <main>
                {/* 其他应用内容 */}
            </main>
        </div>
    );
}

export default App; 