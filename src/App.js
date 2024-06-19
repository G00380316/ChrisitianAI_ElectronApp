import React, { useState } from 'react';

function App() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);

    const sendMessage = async () => {
        if (!input) return;

        const userMessage = `User: ${input}`;
        setMessages([...messages, userMessage]);

        const response = await window.electronAPI.askQuestion(input);
        const agentMessage = `Agent: ${response}`;
        setMessages([...messages, userMessage, agentMessage]);
        setInput('');
    };

    return (
        <div>
            <h1>Chat with AI</h1>
            <div id="messages">
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default App;

