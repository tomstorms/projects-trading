import mongoose, { Error } from 'mongoose';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import passport from 'passport';
import passportLocal from 'passport-local';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './Models/User';
import { IMongoUser, IUser } from './Interface/UserInterface';

/**
 * ENV SETUP
 */
dotenv.config({
    path: `.env.${process.env.NODE_ENV}`,
});

/**
 * DATABASE
 */
mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_NAME}?retryWrites=true&w=majority`, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err : Error) => {
    if (err) {
        console.log('MongoFailed');
        throw err;
    }
    console.log("Connected to MongoDB");
});

/**
 * MIDDLEWARE
 */
const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.SITE_CLIENT_URL, credentials: true })); // Persist session cookie on client
// app.set("trust proxy", 1);
app.use(
    session({
        secret: (process.env?.SITE_EXPRESS_SECRET ? process.env.SITE_EXPRESS_SECRET : 'secretcode'),
        resave: true,
        saveUninitialized: true,
        // REQUIRED IF USING SSL
        // cookie: {
        //     sameSite: 'none',
        //     secure: true,
        //     maxAge: 1000 * 60 * 60 * 24 * 7 // One Week
        // }
    })
);
app.use(passport.initialize());
app.use(passport.session());

/**
 * PASSPORT
 */
// Local Logins
const LocalStrategy = passportLocal.Strategy;
passport.use(new LocalStrategy((username: string, password: string, done) => {
    User.findOne({ username: username }, (err : Error, user: IMongoUser) => {
        if (err) throw err;
        if (!user) return done(null, false); // return 'Unauthorised'
        bcrypt.compare(password, user.password, (err, result: boolean) => {
            if (err) throw err;
            if (result === true) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    });
}));

passport.serializeUser((user : IMongoUser, done : any) => {
    console.log('serializeUser');
    console.log(user._id);
    return done(null, user._id);
});

passport.deserializeUser((id : string, done : any) => {
    User.findById(id, (err: Error, doc: IMongoUser) => {
        const userInformation : IUser = {
            username: doc.username,
            userLevel: doc.userLevel,
            id: doc._id,
            googleId: doc.googleId,
            displayName: doc.displayName,
            firstName: doc.firstName,
            lastName: doc.lastName,
            profilePic: doc.profilePic,
            profilePicUrl: doc.profilePicUrl,
        };

        console.log('userInformation');
        console.log(userInformation);
        // Whatever we return goes to the client and binds to the req.user property
        return done(null, userInformation);
    })
});

// Google Login
const GoogleStrategy = require('passport-google-oauth20').Strategy;
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CLIENT_CALLBACK_ENDPOINT
    }, (accessToken : any, refreshToken : any, profile : any, cb : any) => {
        console.log(profile);
        
        User.findOne({ googleId: profile.id }, async (err: Error, doc: IMongoUser) => {
            if (err) {
                return cb(err, null);
            }

            if (!doc) {
                const newUser = new User({
                    googleId: profile.id,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    displayName: profile.displayName,
                    username: profile.name.givenName,
                    profilePicUrl: profile?.photos[0]?.value,
                });

                await newUser.save();
                cb(null, newUser);
            }
            console.log(doc);
            cb(null, doc);
        })

    }
));
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: process.env.SITE_CLIENT_URL }), (req, res) => {
    // Successful authentication, redirect home.
    res.redirect(process.env.SITE_CLIENT_URL!);
});

/**
 * ROUTES
 */
app.post('/register', async (req : Request, res : Response) => {

    const { username, password } = req?.body;
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        returnJSON(res, { status: 'fail', msg: 'Invalid values' });
        return;
    }

    User.findOne({ username }, async (err : Error, doc : IMongoUser) => {
        if (err) throw err;
        if (doc) returnJSON(res, { status: 'fail', msg: 'User already exists' });
        if (!doc) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = new User({
                username,
                password: hashedPassword,
            });
            await newUser.save();
            returnJSON(res, { status: 'success' });
        }
    });

});

app.post('/login', passport.authenticate('local'), (req, res) => {
    returnJSON(res, { status: 'success' });
});

app.get('/user', (req, res) => {
    returnJSON(res, { status: 'success', data: req.user });
});

app.get('/logout', (req, res) => {
    req.logout();
    returnJSON(res, { status: 'success' });
});

// Setup Middleware
const isAdministratorMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { user } : any = req;
    if (user) {
        User.findOne({ username: user.username }, (err : Error, doc : IMongoUser) => {
            if (err) throw err;
            if (doc?.userLevel === 9) {
                next();
            }
            else {
                returnJSON(res, { status: 'fail', msg: 'Sorry, only admins can perform this' });
            }
        });
    }
    else {
        returnJSON(res, { status: 'fail', msg: 'Sorry, you are not lgoged in' });
    }
}

app.post('/deleteuser', isAdministratorMiddleware, async (req, res) => {
    const { id } = req?.body;
    await User.findByIdAndDelete(id);

    returnJSON(res, { status: 'success' });
});

app.get('/getallusers', isAdministratorMiddleware, async (req, res) => {
    await User.find({}, (err : Error, data : IMongoUser[]) => {
        if (err) throw err;

        const filteredUsers : IUser[] = [];
        data.forEach((item: IMongoUser) => {
            const userInformation = {
                id: item._id,
                username: item.username,
                userLevel: item.userLevel,
            }
            filteredUsers.push(userInformation);
        })

        returnJSON(res, { status: 'success', data: filteredUsers });
    });
});





/**
 * SERVER
 */
app.listen(process.env.SITE_EXPRESS_PORT, () => {
    console.log("Server started");
});


const returnJSON = (res : Response, data : any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
}