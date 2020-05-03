const http   = require('http');
const app    = require('./src/app');
const port   = process.env.PORT || 3000;
const server = http.createServer(app);

const fs = require('fs');
const { promisify } = require('util');

const exists = promisify(fs.exists);
const writeFile = promisify(fs.writeFile);

server.listen(port, async ()  => {
    try{
        const dbExists = await exists("./database.json")
        
        if(!dbExists){
            const initDB = {
                nextId: 1,
                accounts: []
            }
            
            await writeFile("./database.json", JSON.stringify(initDB))
        }
    }catch(err){
        console.log("Error on starting API.")
    }

    console.log('API runing on port '+port+'!')
});