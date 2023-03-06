import express from 'express';
import upload from '../middleware/filesAccessMulter.js'
import {  
    getAllProperties,
    getPropertiesFromPerson,
    getproperty, 
    addProperty, 
    deleteProperty, 
    updateproperty,
    updateExpenditure 
} from '../controller/property.js';

const router = express.Router();


router.get('/getAllProperties', getAllProperties);

router.get('/getPropertiesFromPerson', getPropertiesFromPerson)

router.get('/getProperty', getproperty);

router.post('/addProperty', upload.array('file'), addProperty);

router.delete('/deleteProperty', deleteProperty);

router.put('/updateProject', updateproperty);

router.put('/updateExpenditure', updateExpenditure);

export default router;