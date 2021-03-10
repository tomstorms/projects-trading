import React, { useContext } from 'react'
import { myContext } from '../Context/Context'

export default function ProfilePage() {
    const ctx = useContext(myContext);
    return (
        <div>
            <h1>Your Profile</h1>
            <table>
                <tbody>
                    <tr>
                        <td>Display Name:</td>
                        <td>{ctx.displayName}</td>
                    </tr>
                    <tr>
                        <td>First Name:</td>
                        <td>{ctx.firstName}</td>
                    </tr>
                    <tr>
                        <td>Last Name:</td>
                        <td>{ctx.lastName}</td>
                    </tr>
                    <tr>
                        <td>Profile Pic:</td>
                        <td><img src={ctx.profilePicUrl} alt={ctx.displayName + ` profile picture`} /></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
