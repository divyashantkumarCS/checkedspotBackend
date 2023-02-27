import { app } from "../services/expressThings";


//Getting all properties posted from the DB
app.get('/getAllProperties', getAllProperties);

//Get specific requested Property from the DB
app.get('/getProperty', getProperty);

//add Property data to the DB
app.post('/postProperty', postProperty);