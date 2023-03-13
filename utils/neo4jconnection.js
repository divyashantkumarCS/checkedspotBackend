import neo4j from 'neo4j-driver';
import dbconfig from '../config/neo4j.config.js'

const { uri, username, password } = dbconfig;

const driver = neo4j.driver(
    uri, 
    neo4j.auth.basic(username, password)
);


export default driver;