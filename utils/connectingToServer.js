import express from 'express';
import logger from './logger.js'

const PORT = 9191;

const app = express();

const serverlistner = function() {
    return app.listen(PORT, (err) => {
        if(err) {
            console.log(err);
        }
        logger.info(`Server is running on PORT : ${PORT}`)
    })
}

// export default express;
export {PORT, app, serverlistner};