import {ChangeEvent, useEffect, useState} from "react";
import {ConnectionConfiguration} from "five-minute-chat-client/dist/ConnectionConfiguration";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export interface LoginProps {
    connectionConfiguration: ConnectionConfiguration;
    loginCallback: (config : ConnectionConfiguration) => void;
}

export const Login = ( props : LoginProps ) => {
    const [applicationId, setApplicationId] = useState("");
    const [applicationSecret, setApplicationSecret] = useState("");
    const [uniqueUserId, setUniqueUserId] = useState("");

    useEffect(() => {
        setApplicationId(props.connectionConfiguration.applicationId);
        setApplicationSecret(props.connectionConfiguration.applicationSecret);
        setUniqueUserId(props.connectionConfiguration.uniqueUserId);
    }, []);

    const applicationIdEdited = ( e: ChangeEvent<HTMLInputElement> ) => {
        setApplicationId(e.target.value);
    };
    const applicationSecretEdited = ( e: ChangeEvent<HTMLInputElement> ) => {
        setApplicationSecret(e.target.value);
    };
    const uniqueUserIdEdited = ( e: ChangeEvent<HTMLInputElement> ) => {
        setUniqueUserId(e.target.value);
    };
    
    const login = () => {
        let updatedConfig = props.connectionConfiguration;
        updatedConfig.applicationId = applicationId;
        updatedConfig.applicationSecret = applicationSecret;
        updatedConfig.uniqueUserId = uniqueUserId;
        props.loginCallback( updatedConfig );
    };
    
    return (
        <div className="centered vertical-list">
            <h3>Login</h3>
            <p className="half-width">You can use your own application if you have one already, but the pre-filled demo application works well for demonstration purposes.</p>

            <div className="horizontal-list centered" style={{height:200}} >
                <div className="vertical-list full-height centered" >
                    <label className="margin-md full-width" >Application Id</label>
                    <label className="margin-md full-width" >Application Secret</label>
                    <label className="margin-md full-width" >Unique User Id</label>
                </div>

                <div className="vertical-list" >
                    <input type="text" className="margin-sm" value={applicationId} onChange={applicationIdEdited} />
                    <input type="text" className="margin-sm" value={applicationSecret} onChange={applicationSecretEdited} />
                    <input type="text" className="margin-sm" value={uniqueUserId} onChange={uniqueUserIdEdited} />
                </div>
                <div className="end full-height">
                    <button className="login-button margin-md" onClick={login}>CONNECT</button>
                </div>
            </div>
        </div>
    );
};

