import express from 'express';
import {
    oAuth, 
    register, 
    login,
    provideAccess
} from '../controller/user.js'

const router = express.Router();


router.post('/oAuthLogin', oAuth);

router.post('/register', register);

router.post('/login', login);

router.post('/provideAccess', provideAccess);


export default router;