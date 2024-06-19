import React, { useState , useRef, useEffect } from 'react';
import { Checkbox, Grid, Stack, Typography } from '@mui/joy';
import { LoadingButton } from '@mui/lab';
import moment from 'moment';
import InputEmojiWithRef from 'react-input-emoji';
import "./index.css";

function App() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const scroll = useRef();

    const handleKeyPress = async () => {
        if (!input) return;
        // Call the function to send the message when Enter is pressed
        const response = await window.electronAPI.askQuestion(input);
        
        const userMessage = {type: 'user', text: input};
        setMessages([...messages, userMessage]);
        setInput("");

        const agentMessage = { type: 'agent', text: response};
        setMessages([...messages, userMessage, agentMessage]);
    };

   /* const handleButtonPress = async() => {
    
    }*/
    
    useEffect(() => {
        scroll.current?.scrollIntoView({ behaviour: "smooth" })
    }, [messages]);

    return (   
        <div className="chat_box">
            <div className="chat_header">
                <Grid display={"flex"} flexDirection={"row"} justifyContent={"space-between"} spacing={1} flex={1}>
                    <div></div>
                    <Stack>
                        <span className="title" >RabbiGpt</span>
                    </Stack>
                    <button className="button">
                        Forget
                    </button>
                </Grid>
            </div>
        <div className="chat_messages">
            <div className="messages_box">
                <div className="messages">
                        {messages && messages.map((message, index) =>
                            <div key={index} className={message?.type === 'user' ? "message" : "user_message"} ref={scroll}>
                    <span className={message?.type === 'user' ? "" : "letter"}>{message.text}</span>
                    <span className="date">{moment(message.createdAt).calendar()}</span>
                            </div>
            )}
                </div>
            </div>
            </div>
            <div className="chat_input">
            <InputEmojiWithRef
            value={input}
            onChange={setInput}
            onEnter={handleKeyPress}
            fontFamily="nunito"
            borderColor="rgba(72,112,223,0.2)"
            disableRecent={true}
            placeholder="Ask your Rabbi AI a Question? Dont be shy..." />
            </div>
        </div>
    );
}

export default App;

