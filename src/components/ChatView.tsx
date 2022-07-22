import {ChangeEvent, KeyboardEventHandler, useCallback, useEffect, useRef, useState} from "react";

import {Connection} from "five-minute-chat-client/dist/Connection";
import {ConnectionConfiguration} from "five-minute-chat-client/dist/ConnectionConfiguration";
import {FiveMinuteChat} from "five-minute-chat-client/dist/Fiveminutes.api";

import { parseISO, format } from 'date-fns'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';

export interface ChatViewProps {
    connectionConfiguration: ConnectionConfiguration;
}

interface ConnectionContainer{
    connection?: Connection;
}

interface Message{
    sentAt: string;
    fromUser: FiveMinuteChat.UserInfo;
    content: string;
}

export const ChatView = ( props: ChatViewProps) => {
    const scrollDivRef = useRef<null | HTMLDivElement>(null);
    const inputFieldRef = useRef<null | HTMLInputElement>(null);

    const [connectionContainer, setConnectionContainer] = useState<ConnectionContainer>({} );
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [canSendMessage, setCanSendMessage] = useState<boolean>(false );
    const [currentMessage, setCurrentMessage] = useState<string>("");
    const [username, setUsername] = useState<string>();
    const [userDisplayId, setUserDisplayId] = useState<string>();
    
    const whisperRegexp = /^\/whisper ([A-z0-9]{4,16}) (.*)/;
    
    let isConnecting = false;
    let userDisplayIdVar  = "" ;
    
    useEffect(() => {
        if(!isConnecting && connectionContainer.connection === undefined){
            isConnecting = true;
            let connection = new Connection( props.connectionConfiguration );
            connection.onConnectionEstablished( () => setIsConnected(true) );
            connection.onWelcome( async message => onWelcome(message, connection));
            connection.onUserInfoResponse( async message => await onUserInfo(message, connection));
            connection.onChannelHistory( async message => await onChannelHistory(message));
            connection.onWhisperMessage( message => onWhisperMessage(message));
            connection.onChatMessage( message => onChatMessage(message));
            connection.start();
            setConnectionContainer({connection: connection });
        }
        else if(connectionContainer.connection !== undefined){
            isConnecting = false;
        }
    }, [connectionContainer]);
    
    const onWelcome = (message: FiveMinuteChat.ServerWelcome, connection : Connection ) => {
        setUserDisplayId( message.DisplayId );
        userDisplayIdVar = message.DisplayId;
        
        const request : FiveMinuteChat.ClientChannelHistoryRequest = {
            ChannelName: "Global"
        };
        connection.sendClientChannelHistoryRequest( request );
    };

    const onUserInfo = useCallback(
        (message: FiveMinuteChat.ServerUserInfoResponse, connection : Connection ) => {
            if(message.UserDisplayId === userDisplayIdVar){
                setUsername(message.Username);
            }
        },
        [userDisplayId]
    );

    const onChannelHistory = useCallback(
        (message: FiveMinuteChat.ServerChannelHistoryResponse ) => {
            if( message.ChannelName !== "Global") {
                return;
            }
            let newMessages = message.ChatMessages
                .sort( (f,s) => parseISO( f.SentAt ).getTime() - parseISO( s.SentAt ).getTime() )
                .map( message => {
                    let foo : Message = {
                        sentAt: format( parseISO( message.SentAt ), "yyyy-MM-dd HH:mm:ss" ),
                        fromUser: message.FromUser,
                        content: message.Content
                    }
                    return foo;
                } );
            
            setMessages( oldMessages => [...oldMessages, ...newMessages]);
        },
        [messages]
    );
    
    const onWhisperMessage = async (message: FiveMinuteChat.ServerWhisperMessage ) => {
        let dateTime = parseISO( message.SentAt );
        let newMessage: Message = {
            sentAt: `${format( dateTime, "yyyy-MM-dd HH:mm:ss" )} (whisper)`,
            fromUser: message.FromUser,
            content: message.Content
        };
        setMessages( oldMessages => [...oldMessages, newMessage]);
    };

    const onChatMessage = async (message: FiveMinuteChat.ServerChatMessage ) => {
        let dateTime = parseISO( message.SentAt );
        let newMessage: Message = {
            sentAt: format( dateTime, "yyyy-MM-dd HH:mm:ss" ),
            fromUser: message.FromUser,
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

    const handleWhisperClick = async (userInfo : FiveMinuteChat.UserInfo) => {
        setCurrentMessageTo(`/whisper ${userInfo.DisplayId} `);
        inputFieldRef.current?.focus();
    }
    
    const sendMessage = async ( ) => {
        if(!canSendMessage) {
            return;
        }
        if(connectionContainer.connection === undefined)
            return;
        
        let match = currentMessage.match( whisperRegexp );
        if( match ){
            let newMessage : FiveMinuteChat.ClientWhisperMessage = {
                Content: match[2],
                Recipient: match[1]
            };
            await connectionContainer.connection.sendClientWhisperMessage( newMessage );
        }
        else {
            let newMessage : FiveMinuteChat.ClientChatMessage = {
                Content: currentMessage,
                ChannelName: "Global"
            };
            await connectionContainer.connection.sendClientChatMessage( newMessage );
        }
        setCurrentMessageTo("");
    };

    return (
        <div className="flex full-height">
            <div className="vertical-list">
                {!isConnected && 
                    <p>Connecting...</p>
                }
                { userDisplayId !== undefined &&
                    <div>Logged in  {username} (@{userDisplayId})</div>
                }
                <div className="chatLogContainer padding-sm">
                    {messages.length === 0 &&
                        <h4>Wow, such empty!</h4>    
                    }
                    {messages.map((message, i) => {
                        return (
                            <div key={i} className="chatEntryContainer vertical-list margin-md padding-sm">
                                <div className="start horizontal-list">
                                    <div className="chatEntryTimestamp">
                                        {( message.fromUser.DisplayId === userDisplayId || message.fromUser.UserType === FiveMinuteChat.UserType.System ) &&
                                            <span>{message.fromUser.Name}</span>
                                        }
                                        {message.fromUser.DisplayId !== userDisplayId && message.fromUser.UserType !== FiveMinuteChat.UserType.System &&
                                            <span className="whisper-button" onClick={() => handleWhisperClick(message.fromUser)}><FontAwesomeIcon className="whisper-icon" icon={faCommentDots} />&nbsp;{message.fromUser.Name}</span>
                                        }
                                       &nbsp;@&nbsp;{message.sentAt}</div>
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
                    <input ref={inputFieldRef} type="text" placeholder="Type a message here..." value={currentMessage} onChange={currentMessageEdited} onKeyDown={event => handleInputKeyDown(event.key)} className="margin-sm" />
                    <button onClick={sendMessage} className="margin-sm" disabled={!canSendMessage} >Send</button>
                </div>
            </div>
        </div>
    );
};
