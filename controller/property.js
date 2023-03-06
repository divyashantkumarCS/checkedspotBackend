import driver from "../config/neo4jconfig.js ";
import neo4j, { int } from 'neo4j-driver';

//getting all properties irrespective of anything
const getAllProperties = async (req, res) => {
    try {
        const session = driver.session();
    
        //Promise API
        const result = await session.executeRead(tx => tx.run(
            `
                MATCH (u:User)-[r:CREATED]->(prop:Property)
                return u, prop, ID(u), ID(prop) 
            `,{}
        ));

        //Streaming API
        // session.executeRead(tx => tx.run(
        //     `
        //         MATCH (u:User)-[r:RELATED_TO]->(prop:Property)
        //         return u, prop, ID(u), ID(prop) 
        //     `,{}
        // )).subscribe({
        //     onKeys: keys => {
        //       console.log(keys) // ['name]
        //     },
        //     onNext: record => {
        //       console.log(record.get('name')) // 'Alice'
        //     },
        //     onCompleted: (summary) => {
        //       // `summary` holds the same information as `res.summary`
        
        //       // Close the Session
        //       session.close()
        //     },
        //     onError: error => {
        //       console.log(error)
        //     }
        // })
    
        const data = result?.records?.map(row => {
            return {
                "propertyID" : (row.get('ID(prop)')).toNumber(),
                "userID" : (row.get('ID(u)')).toNumber(),
                "name" : row.get('u').properties.name,
                "email" : row.get('u').properties.email,
                "mobile" : row.get('u').properties.mobile,
                "ownershipType" : row.get('prop').properties.ownershipType,
                "carpetArea" : row.get('prop').properties.carpetArea,
                "noOfBedrooms" : row.get('prop').properties.noOfBedrooms,
                "noOfBathroom" : row.get('prop').properties.noOfBathroom,
                "noOfKithen" : row.get('prop').properties.noOfKithen,
                "otherAminities" : row.get('prop').properties.otherAminities,
                "lobby" : row.get('prop').properties.lobby,
                "dinningArea" : row.get('prop').properties.dinningArea,
                "garden" : row.get('prop').properties.garden,
                "parkingLot" : row.get('prop').properties.parkingLot,
                "alevator" : row.get('prop').properties.alevator,
                "furnishedStatus" : row.get('prop').properties.furnishedStatus,
                "imageData" : row.get('prop').properties.imageData
            }
        })
    
        session.close();
    
        res.send({
            "status" : 200,
            "message" : "Getting All data",
            "data" : data
        })
    }catch(err) {
        console.log(err);
    }finally {
        console.log("Sessions")
    }
};


//getting all property from a perticular person unsing the personID
const getPropertiesFromPerson = async (req, res) => {
    const userId = int(req?.query?.userId);
    
    //pagenation requirements
    const pageNumber = req?.query?.pageNumber;
    const limit = req?.query?.limit || 5;
    const skipItems = ((pageNumber-1)*limit);

    console.log(userId);
    const session = driver.session();

    const result = await session.executeWrite(
        tx => tx.run(
            `
                MATCH (u:User)-[:CREATED]->(prop:Property)
                WHERE ID(u) = $userId
                RETURN prop SKIP $skipItems LIMIT $limit
            `,
            {
                userId : userId,
                skipItems : skipItems,
                limit : limit
            }
        )
    )

    const data = result?.records?.map(row => {
        return row.get('prop')
    })

    res.status(200).send({
        "message" : `Retrived all Properties from Person with ID ${userId.toNumber()}`,
        "data" : data
    })
}


// getting specific property using propetyID
const getproperty = async (req, res) => {
    const propertyId = int(req?.query?.propertyId);

    const session = driver.session();

    const result = await session.executeRead(
        tx => tx.run(
            `
                MATCH (prop:Property)
                WHERE ID(prop) = $propertyId
                RETURN prop
            `,
            {
                propertyId : propertyId
            }
        )
    )

    session.close();

    const data = result?.records[0]?.get('prop');

    res.status(200).send(data);
}


const addProperty= async (req, res) => {
    
    const requestData = { "bodyData" : req.body, "fileuploads" : req.files}
    // console.log(requestData);

    const obj = {
        "name" : requestData.bodyData.fullName || "NOT-AVAILABLE",
        "email" : requestData.bodyData.email || "NOT-AVAILABLE",
        "mobile" : requestData.bodyData.mobile || "NOT-AVAILABLE",
        "propertyNumber" : requestData.bodyData.propertyNumber || "NOT_AVAILABLE",
        "type" : requestData.bodyData.type || "NOT_AVAILABLE",
        "ownershipType" : requestData.bodyData.ownership || "NOT-AVAILABLE",
        "carpetArea" : requestData.bodyData.carpetArea || "NOT-AVAILABLE",
        "noOfBedrooms" : requestData.bodyData.noOfBedrooms || "NOT-AVAILABLE",
        "noOfBathroom" : requestData.bodyData.noOfBathroom || "NOT-AVAILABLE",
        "noOfKithen" : requestData.bodyData.noOfKithen || "NOT-AVAILABLE",
        "otherAminities" : requestData.bodyData.otherAminities || "NOT-AVAILABLE",
        "lobby" : requestData.bodyData.lobby || "NOT-AVAILABLE",
        "dinningArea" : requestData.bodyData.dinningArea || "NOT-AVAILABLE",
        "garden" : requestData.bodyData.garden || "NOT-AVAILABLE",
        "parkingLot" : requestData.bodyData.parkingLot || "NOT-AVAILABLE",
        "alevator" : requestData.bodyData.alevator || "NOT-AVAILABLE",
        "furnishedStatus" : requestData.bodyData.furnishedStatus || "NOT-AVAILABLE",
        "imageData" : requestData.bodyData.imageData || [],
    }

    const session = driver.session();

    const result = await session.executeWrite(tx => tx.run(
        `
            MERGE (u:User {name : $userName})
            SET u.email = $email, u.mobile = $mobile

            MERGE (prop:Property {userId : ID(u), propertyNumber : $propertyNumber})
            SET prop.type = $type,
                prop.carpetArea = $carpetArea,
                prop.noOfBedrooms = $noOfBedrooms,
                prop.noOfBathroom = $noOfBathroom,
                prop.noOfKithen = $noOfKithen,
                prop.otherAminities = $otherAminities,
                prop.lobby = $lobby,
                prop.dinningArea = $dinningArea,
                prop.garden = $garden,
                prop.parkingLot = $parkingLot, 
                prop.alevator = $alevator,
                prop.furnishedStatus = $furnishedStatus,
                prop.imageData = $imageData,
                prop.ownership = $ownershipType
                
            MERGE (exp:Expenditure {propertyId : ID(prop), expenditure : "[]"})
            SET exp.name = 'Expenditure'

            MERGE (doc:Document {propertyId : ID(prop), document : "[]"})
            SET doc.name = 'Document'

            MERGE (g:Gallery {propertyId : ID(prop), gallery : "[]"})
            SET g.name = 'Gallery'

            MERGE (oth:Other {name : 'Other', propertyId : ID(prop)})

            MERGE (u)-[cr:CREATED]->(prop)
            SET cr.dateOfCreation = $dateOfCreation

            MERGE (u)-[:HAS_WRITE_ACCESS]->(prop)
            MERGE (u)-[:HAS_WRITE_ACCESS]->(exp)
            MERGE (u)-[:HAS_WRITE_ACCESS]->(oth)
            MERGE (u)-[:HAS_WRITE_ACCESS]->(doc)
            MERGE (u)-[:HAS_WRITE_ACCESS]->(g)

            MERGE (exp)-[:BELONGS_TO]->(prop)
            MERGE (oth)-[:BELONGS_TO]->(prop)
            MERGE (doc)-[:BELONGS_TO]->(prop)
            MERGE (g)-[:BELONGS_TO]->(prop)

            RETURN u, prop, ID(u), ID(prop)       
        `,{
            propertyNumber : obj.propertyNumber,
            type : obj.type,
            userName : obj.name,
            email : obj.email,
            mobile : obj.mobile,
            ownershipType : obj.ownershipType,
            carpetArea : obj.carpetArea,
            noOfBedrooms : obj.noOfBedrooms,
            noOfBathroom : obj.noOfBathroom,
            noOfKithen : obj.noOfKithen,
            otherAminities : obj.otherAminities,
            lobby : obj.lobby,
            dinningArea : obj.dinningArea,
            garden : obj.garden,
            parkingLot : obj.parkingLot,
            alevator : obj.alevator,
            furnishedStatus : obj.furnishedStatus,
            imageData : obj.imageData,
            dateOfCreation : (new Date()).toDateString()
        }
    ))

    session.close();

    console.log("ID(prop)",(result?.records[0].get('ID(prop)')).toNumber())

    const data = result?.records?.map(row => {
        return {
            "propID" : (row.get('ID(prop)')).toNumber(),
            "name" : row.get('u').properties.name,
            "email" : row.get('u').properties.email,
            "mobile" : row.get('u').properties.mobile,
            "type" : row.get('prop').properties.type,
            "ownershipType" : row.get('prop').properties.ownershipType,
            "carpetArea" : row.get('prop').properties.carpetArea,
            "noOfBedrooms" : row.get('prop').properties.noOfBedrooms,
            "noOfBathroom" : row.get('prop').properties.noOfBathroom,
            "noOfKithen" : row.get('prop').properties.noOfKithen,
            "otherAminities" : row.get('prop').properties.otherAminities,
            "lobby" : row.get('prop').properties.lobby,
            "dinningArea" : row.get('prop').properties.dinningArea,
            "garden" : row.get('prop').properties.garden,
            "parkingLot" : row.get('prop').properties.parkingLot,
            "alevator" : row.get('prop').properties.alevator,
            "furnishedStatus" : row.get('prop').properties.furnishedStatus,
            "imageData" : row.get('prop').properties.imageData
        }
    })

    res.send({
        "status": 200,
        "message": "Property added Successfully",
        "data" : data
    })
};


const deleteProperty = async (req, res) => {
    const propertyId = int(req.body.propertyId);
    const session = driver.session();

    // const result = await session.executeRead(
    //     tx => tx.run(
    //         `
    //             MATCH (u:User)-[r:RELATED_TO]->(prop:Property)
    //             WHERE u.userId = $userId AND prop.propertyId = $propertyId
    //             DETACH DELETE prop
    //         `,{
    //             propertyId : propertyId,
    //             userId : userId
    //         }
    //     )
    // )

    const result = await session.executeWrite(
        tx => tx.run(
            `
                MATCH (prop:Property),
                      (prop)<-[:BELONGS_TO]-(d:Document {propertyId : $propertyId}), 
                      (prop)<-[:BELONGS_TO]-(o:Other {propertyId : $propertyId}), 
                      (prop)<-[:BELONGS_TO]-(g:Gallery {propertyId : $propertyId}), 
                      (prop)<-[:BELONGS_TO]-(e:Expenditure {propertyId : $propertyId})
                WHERE ID(prop) = $propertyId
                DETACH DELETE prop, d, o, g, e
            `,{
                propertyId : propertyId
            }
        )
    )


    res.status(200).send({
        "propertyId" : propertyId,
        "message" : "Node deleted successfully"
    })
};


const updateproperty = async (req, res) => {
    const params = {
        userId : int(req?.body?.userId),
        propertyId : int(req?.body?.propertyId),
    };

    const session = driver.session();

    const result = await session.executeRead(
        tx => tx.run(
            `
                MATCH (prop:Property)
                WHERE ID(prop) = $propertyId
                SET 
                RETURN prop
            `, params
        )
    )

    const data = result?.records?.map(row => {
        return row.get('prop').properties
    })

    res.status(200).send({
        "updatedData" : data,
        "message" : "Node updated successfully"
    })
};


const updateExpenditure = async (req, res) => {
    const propertyId = int(req.body.propertyId);
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
                MATCH (ex:Expenditure {propertyId : $propertyId})
                RETURN ex
            `,
            {
                propertyId : propertyId
            }
        )
    )

    session01.close();

    let data01 = result01?.records[0]?.get('ex').properties.expenditure;
    
    data01 = JSON.parse(data01);
    data01.push(expenditure);
    const updatedData = JSON.stringify(data01);

    /// update with new expenditure data
    const session02 = driver.session();

    const result02 = await session02.executeWrite(
        tx => tx.run(
            `
                MATCH (ex:Expenditure {propertyId : $propertyId})
                SET ex.expenditure = $expenditure
                RETURN ex
            `,
            {
                propertyId : propertyId,
                expenditure : updatedData
            }
        )
    )

    session02.close();
    const data = result02?.records[0].get('ex').properties.expenditure;
    
    res.status(200).send({
        "message" : "Data Updated Seccessfully",
        "data" : JSON.parse(data)
    })
};


export { 
    getAllProperties,
    getPropertiesFromPerson,
    getproperty, 
    addProperty, 
    updateproperty, 
    deleteProperty,
    updateExpenditure 
}; 

// documents = [{
//     type : "",
//     label: "",
//     file: "",
// }]

// Expenditure = [
//     {
//         type : "construction",
//         spentBy : "kashif",
//         spentOn : "12/12/2022",
//         amount:3000,
//         currency:"INR",
//         description:"This was spent on bla bla bla",
//         spentUsing:"Google Pey",
//         attachment:"https://www.billxyz.com"
//     },
//     {
//         type : "construction",
//         spentBy : "kashif",
//         spentOn : "12/12/2022",
//         amount:3000,
//         currency:"INR",
//         description:"This was spent on bla bla bla",
//         spentUsing:"Google Pey",
//         attachment:"https://www.billxyz.com"
//     },
//     {
//         type : "construction",
//         spentBy : "kashif",
//         spentOn : "12/12/2022",
//         amount:3000,
//         currency:"INR",
//         description:"This was spent on bla bla bla",
//         spentUsing:"Google Pey",
//         attachment:"https://www.billxyz.com"
//     },
//     {
//         type : "construction",
//         spentBy : "kashif",
//         spentOn : "12/12/2022",
//         amount:3000,
//         currency:"INR",
//         description:"This was spent on bla bla bla",
//         spentUsing:"Google Pey",
//         attachment:"https://www.billxyz.com"
//     },
// ]