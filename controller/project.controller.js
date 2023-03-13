import driver from '../utils/neo4jconnection.js';
import { int, Date } from "neo4j-driver";


const createProject = async (req, res) => {

    const email = req?.body?.email;
    const projectName = req?.body?.projectName

    const session =  driver.session();

    const result  = await session.executeWrite(
        tx => tx.run(
            `
                MATCH (u:User {email : $email})
                WITH u

                MERGE(p:Project {email : $email, projectName : $projectName})

                MERGE (exp:Expenditure {projectId : ID(p), expenditures : "[]"})
                SET exp.name = 'Expenditure'

                MERGE (doc:Document {projectId : ID(p), documents : "[]"})
                SET doc.name = 'Document'

                MERGE (g:Gallery {projectId : ID(p), gallery : "[]"})
                SET g.name = 'Gallery'

                MERGE (oth:Other {name : 'Other', projectId : ID(p)})

                MERGE (u)-[c:CREATED]->(p)
                SET c.createdOn = Date()

                MERGE (u)-[:HAS_WRITE_ACCESS]->(p)
                MERGE (u)-[:HAS_WRITE_ACCESS]->(exp)
                MERGE (u)-[:HAS_WRITE_ACCESS]->(oth)
                MERGE (u)-[:HAS_WRITE_ACCESS]->(doc)
                MERGE (u)-[:HAS_WRITE_ACCESS]->(g) 

                MERGE (exp)-[:BELONGS_TO]->(p)
                MERGE (oth)-[:BELONGS_TO]->(p)
                MERGE (doc)-[:BELONGS_TO]->(p)
                MERGE (g)-[:BELONGS_TO]->(p)

                RETURN u, p, ID(p)
            `,
            {
                email : email,
                projectName : projectName
            }
        )
    )

    const data =  result?.records[0]?.get('p')
    console.log(data)
    
    res.status(200).send({
        "message" : "Project Created",
        "data" : data
    })
}

const getProject = async (req, res) => {
    const projectId = int(req?.query?.projectId);

    const session = driver.session();

    const result = await session.executeRead(
        tx => tx.run(
            `
                MATCH (p:Project) WHERE ID(p) = $projectId
                RETURN p
            `,
            {
                projectId : projectId
            }
        )
    )

    const data = result?.records[0].get('p').properties;

    res.status(200).send(data);
}

const deleteProject = async (req, res) => {
    const projectId = int(req?.query?.projectId);

    const session = driver.session();

    const result = await session.executeWrite(
        tx => tx.run(
            `
                MATCH (p:Project) WHERE ID(p) = $projectId
                MATCH (ex:Expenditure)-[:BELONGS_TO]->(p)
                MATCH (g:Gallery)-[:BELONGS_TO]->(p)
                MATCH (doc:Document)-[:BELONGS_TO]->(p)
                MATCH (o:Other)-[:BELONGS_TO]->(p)

                DETACH DELETE p, ex, g, doc, o
            `,
            {
                projectId : projectId
            }
        )
    )

    res.status(200).send("Project Deleted Successfully")
}

const getPropertiesForProject = async (req, res) => {
    const projectId = int(req?.query?.projectId);

    const session  = driver.session();

    const result  = await session.executeRead(
        tx => tx.run(
            `
                MATCH (prop:Property {projectId : $projectId})
                RETURN prop
            `,
            {
                projectId : projectId
            }
        )
    )

    const data = result?.records.map(row => {
        return row.get('prop').properties
    })

    res.status(200).send({
        "data" : data
    })
}


const createExpenditure = async (req, res) => {
    const email = req?.body?.email;
    const projectId = int(req?.body?.projectId);

    const session = driver.session();

    const result = await session.executeWrite(
        tx => tx.run(
            `
                MATCH (p:Project) where ID(p) = $projectId
                MATCH (u:User {email : $email}) 
                MERGE(ex:Expenditure {projectId : 15, expenditures: "[]", name: "Expenditure"} ) 
                MERGE (ex)-[:BELONGS_TO]->(p) 
                MERGE (u)-[:HAS_WRITE_ACCESS]->(ex)
                RETURN ex
            `,
            {
                projectId : projectId,
                email : email
            }
        )
    )

    session.close();

    console.log("EXPENDITURE DATA", result.records)
    const data = result?.records[0]?.get('ex').properties;

    res.status(200).send(data);
}


const getExpenditure = async (req, res) => {
    const projectId = int(req?.query?.projectId);
    const session = driver.session();

    const result = await session.executeRead(
        tx => tx.run(
            `
                MATCH (ex:Expenditure) WHERE ex.projectId = $projectId
                RETURN apoc.convert.fromJsonList(ex.expenditures) as expenditures
            `,
            {
                projectId : projectId
            }
        )
    );

    session.close();

    const data = result?.records[0].get('expenditures');

    res.status(200).send(data);
}


const updateExpenditure = async (req, res) => {
    const projectId = int(req?.body?.projectId);
    const expenditure = {
        "type" : req?.body?.type,
        "spentOn" : req?.body?.spentOn,
        "spentBy" : req?.body?.spentBy,
        "amount" : req?.body?.amount,
        "currency" : req?.body?.currency,
        "description" : req?.body?.description,
        "spentUsing" : req?.body?.spentUsing,
        "attachment" : req?.body?.attachment
    }

    //Fetch expenditure 
    const session01 = driver.session();
    const result01 = await session01.executeRead(
        tx => tx.run(
            `
                MATCH (ex:Expenditure {projectId : $projectId})
                RETURN apoc.convert.fromJsonList(ex.expenditures) as expenditures
            `,
            {
                projectId : projectId
            }
        )
    )

    session01.close();

    let data01 = result01?.records[0].get('expenditures');

    data01.push(expenditure);
    const updatedData = JSON.stringify(data01);

    /// update with new expenditure data
    const session02 = driver.session();

    const result02 = await session02.executeWrite(
        tx => tx.run(
            `
                MATCH (ex:Expenditure {projectId : $projectId})
                SET ex.expenditures = $expenditures
                RETURN apoc.convert.fromJsonList(ex.expenditures) as expenditures
            `,
            {
                projectId : projectId,
                expenditures : updatedData
            }
        )
    )

    session02.close();
    const data = result02?.records[0].get('expenditures');
    
    res.status(200).send({
        "message" : "Data Updated Seccessfully",
        "data" : data
    })
};


const deleteExpenditure = async (req, res) => {
    const projectId = int(req?.query?.projectId);

    const session = driver.session();

    const result = await session.executeWrite(
        tx => tx.run(
            `
                MATCH (ex:Expenditure) WHERE ex.projectId = $projectId
                DETACH DELETE ex
            `,
            {
                projectId : projectId
            }
        )
    );

    session.close();

    res.status(200).send(`Expenditure Node BELONGS_TO Project with ID = ${projectId} is Deleted Successfully`);
}


const createDocument = async (req, res) => {
    const email = req?.body?.email;
    const projectId = int(req?.body?.projectId);

    const session = driver.session();

    const result = await session.executeWrite(
        tx => tx.run(
            `
                MATCH (p:Project) where ID(p) = $projectId 
                MATCH (u:User) where u.email = $email 
                MERGE(doc:Document {projectId : 15, documents: "[]", name: "Document"} ) 
                MERGE (doc)-[:BELONGS_TO]->(p) 
                MERGE (u)-[:HAS_WRITE_ACCESS]->(doc)
                RETURN doc
            `,
            {
                projectId : projectId,
                email : email
            }
        )
    )

    session.close();

    const data = result?.records[0].get('doc').properties;

    res.status(200).send(data);
}


const getDocument = async (req, res) => {
    const projectId = int(req?.query?.projectId);
    console.log("projectId ", projectId)
    const session = driver.session();

    const result = await session.executeRead(
        tx => tx.run(
            `
                MATCH (doc:Document) WHERE doc.projectId = $projectId
                RETURN apoc.convert.fromJsonList(doc.documents) as documents
            `,
            {
                projectId : projectId
            }
        )
    );

    const data = result?.records[0]?.get('documents');
    console.log("data ", data)

    res.status(200).send(data);
}


const updateDocument = async (req, res) => {
    const projectId = int(req?.body?.projectId);
    const document = {
        "type" : req?.body?.type,
        "label" : req?.body?.label,
        "file" : req?.body?.file
    }

    //Fetch document 
    const session01 = driver.session();
    const result01 = await session01.executeRead(
        tx => tx.run(
            `
                MATCH (doc:Document {projectId : $projectId})
                RETURN apoc.convert.fromJsonList(doc.documents) as documents
            `,
            {
                projectId : projectId
            }
        )
    )

    session01.close();

    let data01 = result01?.records[0]?.get('documents');

    data01.push(document);
    const updatedData = JSON.stringify(data01);

    /// update with new documents data
    const session02 = driver.session();

    const result02 = await session02.executeWrite(
        tx => tx.run(
            `
                MATCH (doc:Document {projectId : $projectId})
                SET doc.documents = $documents
                RETURN apoc.convert.fromJsonList(doc.documents) as documents
            `,
            {
                propertyId : propertyId,
                documents : updatedData
            }
        )
    )

    session02.close();
    const data = result02?.records[0].get('documents');
    
    res.status(200).send({
        "message" : "Data Updated Seccessfully",
        "data" : data
    })
}


const deleteDocument = async (req, res) => {
    const projectId = int(req?.query?.projectId);

    const session = driver.session();

    const result = await session.executeWrite(
        tx => tx.run(
            `
                MATCH (doc:Document {projectId : $projectId})
                DETACH DELETE doc
            `,
            {
                projectId : projectId
            }
        )
    );

    
    session.close();

    res.status(200).send(`Document Node BELONGS_TO Project with ID = ${projectId} is Deleted Successfully`);
}




export {  
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
}