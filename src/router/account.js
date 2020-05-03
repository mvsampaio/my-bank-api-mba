const express = require('express');
const modelAccount = require('../model/Account');

const router = express.Router();

// Create an account
router.post('/', async (req, res) => {
    try{
        modelAccount.validate(req.body, [        
            ["name", "required|string"],            
            ["balance"  , "required|number"]
        ])
        const account = await modelAccount.save(req.body)
    
        res.send(JSON.stringify(account))
    }catch(err){
        console.log(err.message)
        res.status(400).send(JSON.stringify({err: err.message}))
    }
});

// Return an account
router.get('/:id', async (req, res) => {
    try{
        const account = await modelAccount.findOne(req.params.id)
        
        if(account.length > 0){
            res.send(JSON.stringify(account[0]))
        } else{            
            throw new Error("Account not exist")
        }    
    }catch(err){
        console.log(err)
        res.status(400).send(err.message)
    }
});

// Deposit in account
router.patch('/deposit', async (req, res) => {
    try{
        modelAccount.validate(req.body, [ 
            ["id", "required|number"],
            ["value", "required|number"] 
        ]);
                 
        const deposit = await modelAccount.increment(req.body);           
           
        res.send(JSON.stringify(deposit));        
    }catch(err){
        console.log(err)
        res.status(400).send(err.message)
    }
});

//withdraw from account
router.patch('/withdraw', async (req, res) => {
    try{
        modelAccount.validate(req.body, [ 
            ["id", "required|number"],
            ["value", "required|number"] 
        ]);
        
        const withdraw = await modelAccount.decrement(req.body);           
           
        res.send(JSON.stringify(withdraw));        
    }catch(err){
        console.log(err)
        res.status(400).send(err.message)
    }
});

// Delete an account
router.delete('/:id', async (req, res) => {
    try{
        await modelAccount.remove(req.params.id)
        
        res.status(204).send('Account removed')
    }catch(err){
        console.log(err)
        res.status(400).send(err.message)
    }
})

module.exports = router;