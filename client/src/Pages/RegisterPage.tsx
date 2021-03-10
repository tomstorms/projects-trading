import axios, { AxiosResponse } from 'axios';
import React, { useState } from 'react'

export default function RegisterPage() {

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const register = () => {
        axios.post(process.env.REACT_APP_SERVER_URL + '/register', {
            username,
            password
        }, {
            withCredentials: true
        }).then((res: AxiosResponse) => {
            if (res.data.status === 'success') {
                window.location.href = "/register";
            }
        });
    }

    return (
        <div>
            <h1>Register</h1>
            <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
            <input type="text" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <button onClick={register}>Login</button>
        </div>
    )
}
