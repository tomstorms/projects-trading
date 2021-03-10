import axios, { AxiosResponse } from 'axios';
import React, { useState } from 'react';
import googleLogo from '../Images/logo-google.png';

export default function LoginPage() {

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const login = () => {
        axios.post(process.env.REACT_APP_SERVER_URL! + '/login', {
            username,
            password
        }, {
            withCredentials: true
        }).then((res: AxiosResponse) => {
            if (res.data.status === 'success') {
                window.location.href = "/";
            }
        }, () => {
            console.log('failure');
        });
    }

    const loginWithGoogle = () => {
        console.log("google login clicked");
        window.open(process.env.REACT_APP_SERVER_URL! + process.env.REACT_APP_GOOGLE_AUTH_URL!, '_self');
    }

    return (
        <div>
            <h1>Login</h1>
            <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
            <input type="text" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button onClick={login} className="btn btnLogin">Login</button>
            <button onClick={loginWithGoogle} className="btn btnLogin btnLogin--google"><img src={googleLogo} alt="Google" />Login with Google</button>
        </div>
    )
}
