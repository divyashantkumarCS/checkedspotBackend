import cors from 'cors';
import driver from './config/neo4jconfig.js';
import { app, serverlistner, express } from './config/expressConfig.js';
import userRouter from './routes/user.js';
import propertyRouter from './routes/property.js';

// for parsing application/json
app.use(express.json()); 
// for parsing application/xwww-form-urlencoded
app.use(express.urlencoded()); 
app.use(cors());
// for parsing multipart/form-data
// app.use(upload.array()); 
app.use(express.static('uploads'));



app.use('/users', userRouter);
app.use('/properties', propertyRouter);



driver.close();
serverlistner();