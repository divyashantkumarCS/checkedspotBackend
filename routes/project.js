import express from "express";
import {
    createProject,
    getProject,
    deleteProject,
    getProjectsForUser,
    getPropertiesForProject,
    getExpenditure,
    updateExpenditure,
    deleteExpenditure,
    getDocument,
    deleteDocument
} from '../controller/project.js'

const router = express.Router();



router.post('/', createProject)

router.get('/', getProject)

router.delete('/', deleteProject)

router.get('/:userId', getProjectsForUser)

router.get('/property/:projectId', getPropertiesForProject)


router.get('/expenditure', getExpenditure)

router.put('/expenditure', updateExpenditure)

router.delete('/expenditure', deleteExpenditure)

router.get('/document', getDocument)

router.delete('/document', deleteDocument)



export default router
