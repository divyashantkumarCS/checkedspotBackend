import express from 'express';
import {oAuth, register, login} from '../controller/user.js'

const router = express.Router();


router.post('/oAuthLogin', oAuth);

//Create Person Node on Registering on the site
router.post('/register', register);

//login
router.post('/login', login);

export default router;