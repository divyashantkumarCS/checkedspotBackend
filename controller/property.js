import driver from "../config/neo4jconfig.js ";
import { int } from 'neo4j-driver';


const getAllProperties = async (req, res) => {
    try {
        const session = driver.session();
    
        const result = await session.executeRead(tx => tx.run(
            `
                MATCH (p:Person)-[r:RELATED_TO]->(prop:Property)
                return p, prop, ID(p), ID(prop) 
            `,{}
        ));
    
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
}


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
                prop.imageData = $imageData
            MERGE (p)-[r:RELATED_TO]->(prop)
            SET r.relationship = $ownershipType
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
            imageData : obj.imageData
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
}


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
}


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
}

export { getAllProperties, addProperty, updateproperty, deleteProperty } 