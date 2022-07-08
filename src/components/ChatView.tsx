import {ChangeEvent, KeyboardEventHandler, useEffect, useRef, useState} from "react";

import {Connection} from "five-minute-chat-client/dist/Connection";
import {ConnectionConfiguration} from "five-minute-chat-client/dist/ConnectionConfiguration";
import {FiveMinuteChat} from "five-minute-chat-client/dist/Fiveminutes.api";

import { parseISO, format } from 'date-fns'

export interface ChatViewProps {
    connectionConfiguration: ConnectionConfiguration;
}

interface ConnectionContainer{
    connection?: Connection;
}

interface Message{
    sentAt: string;
    from: string;
    content: string;
}

export const ChatView = ( props: ChatViewProps) => {
    const scrollDivRef = useRef<null | HTMLDivElement>(null);

    const [connectionContainer, setConnectionContainer] = useState<ConnectionContainer>({} );
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [canSendMessage, setCanSendMessage] = useState<boolean>(false );
    const [currentMessage, setCurrentMessage] = useState<string>("");
    
    let isConnecting = false;
    
    useEffect(() => {
        if(!isConnecting && connectionContainer.connection === undefined){
            isConnecting = true;
            let connection = new Connection( props.connectionConfiguration );
            connection.onConnectionEstablished( () => setIsConnected(true) );
            connection.onWhisperMessage(onWhisperMessage);
            connection.onChatMessage(onChatMessage);
            connection.start();
            setConnectionContainer({connection: connection });
        }
    }, []);
    
    useEffect(() => {
        if(connectionContainer.connection !== undefined){
            isConnecting = false;
        }
    }, [connectionContainer]);
    
    const onWhisperMessage = async (message: FiveMinuteChat.ServerWhisperMessage ) => {
        let dateTime = parseISO( message.SentAt );
        let newMessage: Message= {
            sentAt: `${format( dateTime, "HH:mm:ss" )} (whisper)`,
            from: message.FromUser.Name,
            content: message.Content
        };
        setMessages( oldMessages => [...oldMessages, newMessage]);
    };

    const onChatMessage = async (message: FiveMinuteChat.ServerChatMessage ) => {
        let dateTime = parseISO( message.SentAt );
        let newMessage: Message= {
            sentAt: format( dateTime, "HH:mm:ss" ),
            from: message.FromUser.Name,
            content: message.Content
        };
        setMessages( oldMessages => [...oldMessages, newMessage]);
    };

    useEffect(() => {
        scrollDivRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);
    
    const currentMessageEdited = ( e: ChangeEvent<HTMLInputElement> ) => {
        setCurrentMessageTo(e.target.value);
    };
    
    const setCurrentMessageTo = ( value: string ) => {
        setCurrentMessage(value);
        setCanSendMessage(value.length > 0);
    };
    
    const handleInputKeyDown = async (key : string) => {
        if (key === 'Enter' && canSendMessage) {
            await sendMessage();
        }
    }
    
    const sendMessage = async ( ) => {
        if(!canSendMessage) {
            return;
        }
        if(connectionContainer.connection === undefined)
            return;
        let newMessage : FiveMinuteChat.ClientChatMessage = {
            Content: currentMessage,
            ChannelName: "Global"
        };
        await connectionContainer.connection.sendClientChatMessage( newMessage );
        setCurrentMessageTo("");
    };

    return (
        <div className="flex full-height">
            <div className="vertical-list">
                {!isConnected && 
                    <p>Connecting...</p>
                }
                <div className="chatLogContainer padding-sm">
                    {messages.length === 0 &&
                        <h4>Wow, such empty!</h4>    
                    }
                    {messages.map((message, i) => {
                        return (
                            <div key={i} className="chatEntryContainer vertical-list margin-md padding-sm">
                                <div className="start horizontal-list">
                                    <div className="chatEntryTimestamp">{message.from} @ {message.sentAt}</div>
                                </div>
                                <div className="horizontal-list">
                                    <div className="margin-sm chatEntryContent start">{message.content}</div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={scrollDivRef} />
                </div>
                <div className="chatInputContainer padding-md horizontal-list">
                    <input type="text" placeholder="Type a message here..." value={currentMessage} onChange={currentMessageEdited} onKeyDown={event => handleInputKeyDown(event.key)} className="margin-sm" />
                    <button onClick={sendMessage} className="margin-sm" disabled={!canSendMessage} >Send</button>
                </div>
            </div>
        </div>
    );
};
