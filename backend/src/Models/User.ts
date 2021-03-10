import mongoose from 'mongoose';

const user = new mongoose.Schema({
    firstName: String,
    lastName: String,
    displayName: String,
    profilePic: {
        type: Buffer,
        required: false,
    },
    profilePicUrl: {
        type: String,
        required: false,
    },
    username: {
        type: String,
        unique: true,
    },
    password: String,
    userLevel: {
        type: Number,
        default: 0, // 0=user 9=superadmin
    },
    googleId: {
        type: String,
        required: false,
    },
});

export default mongoose.model('User', user);
