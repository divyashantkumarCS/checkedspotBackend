import express from 'express';
import upload from '../middleware/filesAccessMulter.js'
import { addProperty, getAllProperties, updateproperty, deleteProperty } from '../controller/property.js';

const router = express.Router();


router.get('/getAllProperties', getAllProperties);

router.post('/addProperty', upload.array('file'), addProperty);

router.delete('/deleteProject', deleteProperty)

router.put('/updateProject', updateproperty)

export default router;