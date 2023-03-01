import express from 'express';
import upload from '../middleware/filesAccessMulter.js'
import { 
    addProperty, 
    getAllProperties, 
    updateproperty, 
    deleteProperty, 
    updateExpenditure 
} from '../controller/property.js';

const router = express.Router();


router.get('/getAllProperties', getAllProperties);

router.post('/addProperty', upload.array('file'), addProperty);

router.delete('/deleteProject', deleteProperty);

router.put('/updateProject', updateproperty);

router.put('/updateExpenditure', updateExpenditure);

export default router;