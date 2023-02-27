import neo4j from 'neo4j-driver';

const uri = "neo4j+s://5ea191ad.databases.neo4j.io";
const username = "neo4j";
const password = "dNlb8oDnFXhkoP2n30I3wm1bJsimZ89PDJ3rSQwAlVc";

//Connecting to the Neo4j Database
const driver = neo4j.driver(
    uri, 
    neo4j.auth.basic(username, password)
);

driver.close();

export default driver;