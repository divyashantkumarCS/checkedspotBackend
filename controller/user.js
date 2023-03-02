import driver from "../config/neo4jconfig.js";
import bcrypt from 'bcrypt';


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
                MERGE (p:Person {name : $name})
                SET p.email = $email, p.provider = $provider
                RETURN p
            `, params
        )
    )
    
    const data = result?.records?.map(row => {
        const keys = Object.keys(row.get('p').properties);
        const resultObj = {};

        keys.forEach(element => {
            resultObj[element] = row.get('p').properties[element]
        })
        return resultObj;
    });

    console.log(data)

    res.send({
        "status" : 200,
        "data" : data,
        "summary" : result?.summary.counters.updates()
    }) 

}


const register = async(req, res) => {
    // Before creating a Person node We need to check first the the node is already existing or not
    //Well we will use MERGE clause to avoid duplication of the particular Person Node.

    const personData = req.body;
    const password = req.body.password;

    //generate Salt Round for the encryption
    const salt = await bcrypt.genSalt(12);
    //creating hashed password
    const hashedPass = await bcrypt.hash(password, salt);

    const person = {
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
                MERGE (p:Person {name : $name})
                SET p.email = $email, p.password = $password, p.mobile = $mobile
                RETURN p
            `, {
                name : person.name,
                email : person.email,
                password : person.password,
                mobile : person.mobile
            }
        )
    );

    //extracting Data form the result returned by RETURN clause in the Neo4j Query
    const createdData = result.records.map(row => {
        return {
            "name" : row.get('p').properties.name,
            "email" : row.get('p').properties.email,
            "password" : row.get('p').properties.password,
            "mobile" : row.get('p').properties.mobile
        }
    });

    res.send({
        "status" : 200,
        "data" : createdData,
        "summary" : result.summary.counters.updates()
    }) 
}


const login = async (req,res) => {
    const email = req.body.email;
    const password = req.body.password;
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
                MATCH (p:Person)
                WHERE p.email = $email
                return p
            `,{email:email}
        )
    )

    const data = result.records.map(row => {
        return row.get('p').properties
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

    const session = driver.session();
    let result = null;

    if(req?.body?.accessType?.length === 1){
        if((req?.body?.accessType[0])?.toLowerCase() === "read"){
            result = session.executeWrite(
                tx => tx.run(
                    `            
                        MATCH (p:Person)
                        WHERE ID(p) = $personID
                        MATCH (prop:Property)
                        WHERE ID(prop) = $propertyID
        
                        MERGE (p)-[:HAS_READ_ACCESS]->(prop)
                    `,
                    {
                        personID : req?.body?.personID,
                        propertyID : req?.body?.propertyID
                    }
                )
            )

            session.close();

            res.status(200).send({
                "message" : `User has READ and WRITE access`
            })

        } else if((req?.body?.accessType[0])?.toLowerCase() === "write"){
            result = session.executeWrite(
                tx => tx.run(
                    `            
                        MATCH (p:Person)
                        WHERE ID(p) = $personID
                        MATCH (prop:Property)
                        WHERE ID(prop) = $propertyID
        
                        MERGE (p)-[:HAS_WRITE_ACCESS]->(prop)
                    `,
                    {
                        personID : req?.body?.personID,
                        propertyID : req?.body?.propertyID
                    }
                )
            )

            session.close();

            res.status(200).send({
                "message" : `User has READ and WRITE access`
            })
        }
    }else {
        result = session.executeWrite(
            tx => tx.run(
                `            
                    MATCH (p:Person)
                    WHERE ID(p) = $personID
                    MATCH (prop:Property)
                    WHERE ID(prop) = $propertyID
    
                    MERGE (p)-[:HAS_READ_ACCESS]->(prop)
                    MERGE (p)-[:HAS_WRITE_ACCESS]->(prop)
                `,
                {
                    personID : req?.body?.personID,
                    propertyID : req?.body?.propertyID
                }
            )
        )

        session.close();

        res.status(200).send({
            "message" : `User has READ and WRITE access`
        })
    }   
      
}


export  {
    oAuth, 
    register, 
    login,
    provideAccess
};