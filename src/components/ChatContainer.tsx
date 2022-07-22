import {useEffect, useState} from "react";

import {ConnectionConfiguration} from "five-minute-chat-client/dist/ConnectionConfiguration";
import {Login} from "./Login";
import {ChatView} from "./ChatView";

const randomstring = require("random-string");

export const ChatContainer = () => {
    const configuration : ConnectionConfiguration = new ConnectionConfiguration(
        // "https://signalr.gateway.preprod.fiveminutes.io",
        "https://localhost",
        // 443,
        6001,
        "Demo01",
        "DemoSecret",
        `user-${randomstring()}`
    );

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    const onLogin = (config : ConnectionConfiguration) => {
        setIsLoggedIn(true);
    } ;
    
    return (
        <div className="full-height vertical-list">
            <h1>Five Minute Chat Demo</h1>
            {!isLoggedIn &&
                <Login connectionConfiguration={configuration} loginCallback={onLogin}/>
            }
            {isLoggedIn && 
                <ChatView connectionConfiguration={configuration} />
            }
        </div>
    );
};

