import express from "express";
import {
    createProject,
    getProject,
    deleteProject,
    getPropertiesForProject,
    createExpenditure,
    getExpenditure,
    updateExpenditure,
    deleteExpenditure,
    createDocument,
    getDocument,
    deleteDocument
} from '../controller/project.js';


const router = express.Router();



router.post('/', createProject);

router.get('/', getProject);

router.delete('/', deleteProject);

router.get('/properties', getPropertiesForProject);


router.post('/expenditure', createExpenditure);

router.get('/expenditure', getExpenditure);

router.put('/expenditure', updateExpenditure);

router.delete('/expenditure', deleteExpenditure);

router.post('/document', createDocument);

router.get('/document', getDocument);

router.delete('/document', deleteDocument);



export default router
