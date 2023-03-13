import cors from 'cors';
import driver from './config/neo4jconfig.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json' assert { type: "json" };
import { app, serverlistner, express } from './config/expressConfig.js';
import { int } from 'neo4j-driver';
import userRouter from './routes/user.js';
import propertyRouter from './routes/property.js';
import projectRouter from  './routes/project.js';

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

// app.get('/project/expenditure', async (req, res) => {
//     const projectId = int(req?.query?.projectId);
//     console.log(projectId)

//     const session = driver.session();

//     const result = await session.executeRead(
//         tx => tx.run(
//             `
//                 MATCH (ex:Expenditure) WHERE ex.projectId = $projectId
//                 RETURN apoc.convert.fromJsonList(ex.expenditures) as expenditures
//             `,
//             {
//                 projectId : projectId
//             }
//         )
//     );

//     session.close();

//     const data = result?.records[0].get('expenditures');

//     res.status(200).send(data);
// })


driver.close();
serverlistner();