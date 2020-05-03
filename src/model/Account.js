const fs = require('fs')
const { promisify, isNumber } = require('util')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const getDataBase = async () => {
    const data = await readFile("./database.json")
    return JSON.parse(data)
}

const setDataBase = async (data) => {
    await writeFile("./database.json", JSON.stringify(data))
}

const validateFunctions = {
    required : (value, cb) => {
        if(value != undefined && value != null && value != ""){
            return true
        }else{
            cb("Empty field.") // Campo vazio
        }
    },
    string: (value, cb) => {
        if (typeof value === "string"){
            return true
        }else {
            cb("Field must be a string.") // Campo deve ser uma string
        }
    },
    number: (value, cb) => {
        if(typeof value === "number"){
            return true
        }else{
            cb("Field must be a number.") //Campo deve ser um número
        }
    }
}

const AccountModel = {        
    save: async (account) => {
        const db = await getDataBase()        

        if(account.id){
            const oldaccountIndex = db.accounts.findIndex(g => parseInt(g.id) === parseInt(account.id))
            db.accounts[oldaccountIndex] = account
        }else{
            account.id = db.nextId++
            account.timestamps = new Date()
            db.accounts.push(account)
        }

        setDataBase(db)

        return account
    },    
    validate: (account, criteria = []) => {
        if(!account){
            throw new Error("Must send data in the request body") //Deve enviar dados no corpo da requisição
        }
        criteria.forEach(criterio => {
            const field = criterio[0]
            const stringValidations = criterio[1]
            const validations = stringValidations.split("|")

            validations.forEach(validation => {            
                let validationFunction = validateFunctions[validation]                

                validationFunction(account[field], (msg) => {
                    throw new Error(JSON.stringify({
                        field,
                        error: msg
                    }))
                })
            })
        })
    },        
    findOne: async (id) => { 
        id = parseInt(id, 10)
        if (!isNumber(id)){        
            throw new Error("The id field must be a number.") //O campo id deve ser um número
        }
        const db = await getDataBase()
        let accounts = db.accounts

        const account = accounts.filter(account => parseInt(account.id) === id)                

        return account
    },    
    remove: async (id) => {
        const db = await getDataBase()
        let accounts = db.accounts

        db.accounts = accounts.filter(account => parseInt(account.id) !== parseInt(id))

        setDataBase(db)
    },
    increment: async (accountDeposit) => {                
        const db = await getDataBase()        
        
        const Index = db.accounts.findIndex(g => parseInt(g.id) === parseInt(accountDeposit.id));                            

        if (Index == -1){
            throw new Error("Account not exist.") //Conta inexistente
        }

        const accountObj = {
            "name": db.accounts[Index].name,
            "balance": db.accounts[Index].balance += accountDeposit.value,
            "id": db.accounts[Index].id
        }
                
        const account = await AccountModel.save(accountObj)
        
        return account        
    },
    decrement: async (accountWithdraw) => {                
        const db = await getDataBase()        
        
        const Index = db.accounts.findIndex(g => parseInt(g.id) === parseInt(accountWithdraw.id));                            

        if (Index == -1){
            throw new Error("Account not exist.") //Conta inexistente
        }

        if(db.accounts[Index].balance < accountWithdraw.value){
            throw new Error("Insufficient funds.") //Saldo insuficiente
        }

        const accountObj = {
            "name": db.accounts[Index].name,
            "balance": db.accounts[Index].balance -= accountWithdraw.value,
            "id": db.accounts[Index].id
        }
                
        const account = await AccountModel.save(accountObj)
        
        return account        
    }
};

module.exports = AccountModel;