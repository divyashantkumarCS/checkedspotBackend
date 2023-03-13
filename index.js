import cors from 'cors';
import driver from './utils/connectingToNeo4j.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' assert { type: "json" };
import { app, serverlistner} from './utils/connectingToServer.js';
import express from 'express'
import userRouter from './routes/user.router.js';
import propertyRouter from './routes/property.router.js';
import projectRouter from  './routes/project.router.js';

// for parsing application/json
app.use(express.json()); 
// for parsing application/xwww-form-urlencoded
app.use(express.urlencoded()); 
app.use(cors());
// for parsing multipart/form-data
// app.use(upload.array()); 
app.use(express.static('uploads'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/user', userRouter);
app.use('/property', propertyRouter);
app.use('/project', projectRouter);

driver.close();
serverlistner();