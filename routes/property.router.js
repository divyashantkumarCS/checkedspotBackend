import express from 'express';
// import upload from '../middleware/filesAccessMulter.js'
import {  
    getAllProperties,
    getPropertiesFromPerson,
    getproperty, 
    createProperty, 
    deleteProperty, 
    updateproperty,
    updateExpenditure 
} from '../controller/property.controller.js';

const router = express.Router();


router.get('/getAllProperties', getAllProperties);

router.get('/getPropertiesFromPerson', getPropertiesFromPerson)

router.get('/', getproperty);

router.post('/', createProperty);
// router.post('/addProperty', upload.array('file'), addProperty);

router.delete('/', deleteProperty);

router.put('/updateProject', updateproperty);

router.put('/updateExpenditure', updateExpenditure);

export default router;