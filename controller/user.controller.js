import driver from '../utils/neo4jconnection.js';
import bcrypt from 'bcrypt';
import neo4j from "neo4j-driver";


const oAuth = async (req, res) => {

    const params = {
        name : req?.body?.name,
        email : req?.body?.email,
        provider : req?.body?.provider
    };
    // Object.keys(req.body).forEach(element => {
    //     params[element] = req?.body[element]
    // })
    // const query = ""
    // Object.keys(params).forEach(element => {
    //     query += `p.${element} = $${element}`
    // })
    
    const session = driver.session();
    const result = await session.executeWrite(
        tx => tx.run(
            `
                MERGE (u:User {name : $name})
                SET u.email = $email, u.provider = $provider
                RETURN u
            `, params
        )
    )

    console.log(result)
    
    const data = result?.records?.map(row => {
        const keys = Object.keys(row.get('u').properties);
        const resultObj = {};

        keys.forEach(element => {
            resultObj[element] = row.get('u').properties[element]
        })
        return resultObj;
    });

    console.log(data)

    res.send({
        "status" : 200,
        "data" : data,
        "result" : result,
        "summary" : result?.summary.counters.updates()
    }) 

}


const register = async(req, res) => {
    // Before creating a Person node We need to check first the the node is already existing or not
    //Well we will use MERGE clause to avoid duplication of the particular Person Node.

    const UserData = req.body;
    const password = req.body.password;

    //generate Salt Round for the encryption
    const salt = await bcrypt.genSalt(12);
    //creating hashed password
    const hashedPass = await bcrypt.hash(password, salt);

    const User = {
        "name" : "Divyashant",
        "email" : "dk@gmail.com",
        "password" : hashedPass,
        "mobile" : "3242413221"
    }

    //creating a session allows for initiating transactions with database
    const session = driver.session();
    //Executing Write Transaction and receiving the result
    const result = await session.executeWrite(
        tx => tx.run(
            `
                MERGE (u:User {name : $name})
                SET u.email = $email, u.password = $password, u.mobile = $mobile
                RETURN u
            `, {
                name : User.name,
                email : User.email,
                password : User.password,
                mobile : User.mobile
            }
        )
    );

    //extracting Data form the result returned by RETURN clause in the Neo4j Query
    const createdData = result.records.map(row => {
        return {
            "name" : row.get('u').properties.name,
            "email" : row.get('u').properties.email,
            "password" : row.get('u').properties.password,
            "mobile" : row.get('u').properties.mobile
        }
    });

    res.send({
        "status" : 200,
        "data" : createdData,
        "summary" : result.summary.counters.updates()
    }) 
}


const login = async (req,res) => {
    const email = req?.body?.email;
    const password = req?.body?.password;
    // const data = {
    //     email : email,
    //     password : password
    // }

    // console.log(data);
    let authentication;

    const session = driver.session();
    const result = session.executeRead(
        tx=> tx.run (
            `
                MATCH (u:User)
                WHERE u.email = $email
                RETURN u
            `,{email:email}
        )
    )

    const data = result.records.map(row => {
        return row.get('u').properties
    })

    if(data[0].email) {
        authentication = await bcrypt.compare(password, data[0].password)
    }

    if(authentication){
        res.send({
            "status" : 200,
            "data" : data
        })
    }else {
        res.send({
            "status" : 204,
            "data" : "email is Invalid"
        })
    }

    // res.send({
    //     "status" : 200,
    //     "data" : data
    // })
}


const provideAccess = async (req, res) => {

    console.log(req?.body?.accessType[0])

    const userId = neo4j.int(req?.body?.userId)
    const propertyId = neo4j.int(req?.body?.propertyId)
    
    const session = driver.session();
    let result;

    // let result = await session.executeWrite(
    //     tx => tx.run(
    //         `            
    //             MATCH (u:User)
    //             WHERE ID(u) = $userId
    //             MATCH (prop:Property)
    //             WHERE ID(prop) = $propertyId
    //             return u
    //         `,
    //         {
    //             userId :userId,
    //             propertyId : propertyId
    //         }
    //     )
    // )

    // console.log(result?.records[0].get('u'))
    // session.close();
    // res.status(200).send({
    //     "message" : `User has READ and WRITE access`
    // })

    if(req?.body?.accessType?.length === 1){
        if((req?.body?.accessType[0]).toLowerCase() === "read"){
            // const session01 = driver.session();
            result = await session.executeWrite(
                tx => tx.run(
                    `            
                        MATCH (u:User)
                        WHERE ID(u) = $userId
                        MATCH (prop:Property)
                        WHERE ID(prop) = $propertyId
        
                        MERGE (u)-[:HAS_READ_ACCESS]->(prop)
                    `,
                    {
                        userId : userId,
                        propertyId : propertyId
                    }
                )
            )

            session.close();
            
            res.status(200).send({
                "message" : `User has READ access`
            })

        } else if((req?.body?.accessType[0]).toLowerCase() === "write"){
            // const session02 = driver.session();
            result = await session.executeWrite(
                tx => tx.run(
                    `            
                        MATCH (u:User)
                        WHERE ID(u) = $userId
                        MATCH (prop:Property)
                        WHERE ID(prop) = $propertyId
        
                        MERGE (u)-[:HAS_WRITE_ACCESS]->(prop)
                    `,
                    {
                        userId : userId,
                        propertyId : propertyId
                    }
                )
            )
            session.close()
            res.status(200).send({
                "message" : `User has WRITE access`
            })
        }
    }else {
        // const session03 = driver.session();
        result = await session.executeWrite(
            tx => tx.run(
                `            
                    MATCH (u:User)
                    WHERE ID(u) = $userId
                    MATCH (prop:Property)
                    WHERE ID(prop) = $propertyId
    
                    MERGE (u)-[:HAS_READ_ACCESS]->(prop)
                    MERGE (u)-[:HAS_WRITE_ACCESS]->(prop)
                `,
                {
                    userId : userId,
                    propertyId : propertyId
                }
            )
        )
        session.close();
        res.status(200).send({
            "message" : `User has READ and WRITE access`
        })
    }  
      
}


const getProjectsForUser = async (req, res) => {
    const userId = req?.query?.userId;

    const session = driver.session();

    const result = await session.executeRead(
        tx => tx.run (
            `
                MATCH (p:Project {email : $userId})
                RETURN p
            `,
            {
                userId : userId
            }
        )
    )

    const data = result?.records.map((row) => {
        return row.get('p').properties
    })

    if(data){
        res.status(200).send(data)
    }else {
        res.send({
            "message" : "Data Not Found"
        })
    }

}



export  {
    oAuth, 
    register, 
    login,
    provideAccess,
    getProjectsForUser
};