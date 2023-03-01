import driver from "../config/neo4jconfig.js ";
import { int, session } from 'neo4j-driver';


const getAllProperties = async (req, res) => {
    try {
        const session = driver.session();
    
        //Promise API
        const result = await session.executeRead(tx => tx.run(
            `
                MATCH (p:Person)-[r:RELATED_TO]->(prop:Property)
                return p, prop, ID(p), ID(prop) 
            `,{}
        ));

        //Streaming API
        // session.executeRead(tx => tx.run(
        //     `
        //         MATCH (p:Person)-[r:RELATED_TO]->(prop:Property)
        //         return p, prop, ID(p), ID(prop) 
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
                "propID" : (row.get('ID(prop)')).toNumber(),
                "pID" : (row.get('ID(p)')).toNumber(),
                "name" : row.get('p').properties.name,
                "email" : row.get('p').properties.email,
                "mobile" : row.get('p').properties.mobile,
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


const addProperty= async (req, res) => {
    
    const requestData = { "bodyData" : req.body, "fileuploads" : req.files}
    // console.log(requestData);

    const obj = {
        "name" : requestData.bodyData.fullName || "NOT-AVAILABLE",
        "email" : requestData.bodyData.email || "NOT-AVAILABLE",
        "mobile" : requestData.bodyData.mobile || "NOT-AVAILABLE",
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
            MERGE (p:Person {name: $personName})
            SET p.email = $email, p.mobile = $mobile
            MERGE (prop:Property {ownershipType: $ownershipType, name: $personName})
            SET prop.carpetArea = $carpetArea,
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
                prop.personID = ID(p)
            MERGE (exp:Expenditure {propertyID : ID(prop)})
            MERGE (oth:Other {propertyID : ID(prop)})
            MERGE (doc:Document {propertyID : ID(prop)})
            MERGE (p)-[cr:CREATED]->(prop)
            SET cr.dateOfCreation = $dateOfCreation

            MERGE (p)-[:HAS_WRITE_ACCESS]->(prop)
            MERGE (p)-[:HAS_WRITE_ACCESS]->(exp)
            MERGE (p)-[:HAS_WRITE_ACCESS]->(oth)
            MERGE (p)-[:HAS_WRITE_ACCESS]->(doc)

            MERGE (exp)-[:BELONGS_TO]->(prop)
            MERGE (oth)-[:BELONGS_TO]->(prop)
            MERGE (doc)-[:BELONGS_TO]->(prop)
            RETURN p, prop, ID(p), ID(prop)       
        `,{
            personName : obj.name,
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

    console.log("ID(PROP)",(result?.records[0].get('ID(prop)')).toNumber())

    const data = result?.records?.map(row => {
        return {
            "propID" : (row.get('ID(prop)')).toNumber(),
            "name" : row.get('p').properties.name,
            "email" : row.get('p').properties.email,
            "mobile" : row.get('p').properties.mobile,
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
    const propID = int(req.body.id);
    const session = driver.session();

    // const result = await session.executeRead(
    //     tx => tx.run(
    //         `
    //             MATCH (p:Person)-[r:RELATED_TO]->(prop:Property)
    //             WHERE p.pID = $personID AND prop.propID = $propID
    //             DETACH DELETE prop
    //         `,{
    //             propID : propID,
    //             personID : personID
    //         }
    //     )
    // )

    const result = await session.executeWrite(
        tx => tx.run(
            `
                MATCH (prop:Property)
                WHERE ID(prop) = $propID
                DETACH DELETE prop
            `,{
                propID : propID
            }
        )
    )


    res.status(200).send({
        "propertyID" : propID,
        "message" : "Node deleted successfully"
    })
};


const updateproperty = async (req, res) => {
    const params = {
        personID : int(req?.body?.pID),
        propID : int(req?.body?.propID),
    };

    const session = driver.session();

    const result = await session.executeRead(
        tx => tx.run(
            `
                MATCH (prop:Property)
                WHERE ID(prop) = $propID
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
    const propertyID = req?.body?.propertyID;
    const expenditure = req?.body?.expenditure;

    //Fetch expenditure 
    const session01 = driver.session();
    const result01 = session01.executeRead(
        tx => tx.run(
            `
                MATCH (ex:Expenditure {propertyID : $propertyID})
                RETURN ex
            `,
            {
                propertyID : req?.body?.propertyID
            }
        )
    )

    session01.close();

    const data01 = result01?.records[0].get('ex').properties.expenditures;        
    data.push(expenditure);


    /// update with new expenditure data
    const session02 = driver.session();

    const result02 = session.executeWrite(
        tx => tx.run(
            `
                MATCH (ex:Expenditure {propertyID : $propertyID})
                SET ex.expenditures = $expenditures
                RETURN ex
            `,
            {
                expenditures : data01
            }
        )
    )
    session02.close();
    const data = result01?.records[0].get('ex').properties.expenditures;

    res.status(200).send({
        "message" : "Data Updated Seccessfully",
        "data" : data
    })
};

export { 
    getAllProperties, 
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
// ]