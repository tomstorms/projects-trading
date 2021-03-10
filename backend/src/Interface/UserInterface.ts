export interface IUser {
    id: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    profilePic?: Buffer;
    profilePicUrl?: string;
    username: string;
    userLevel: number;
    googleId?: string;
}

export interface IMongoUser {
    _id: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    profilePic?: Buffer;
    profilePicUrl?: string;
    username: string;
    password: string;
    userLevel: number;
    googleId?: string;
}
