const axios = require("axios").default;
const express = require("express");
require('dotenv').config()
var bodyParser = require('body-parser')
const app = express();
const path=require("path")
app.use(express.json())
const static_path=path.join(__dirname,"./dist/jivrus/")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

console.log(static_path)

app.use(express.static(static_path))
// app.get("/",(req,res)=>{
  
// })
////=========to get all contacts===============
app.get("/server/getContacts/:key", async (req, res) => {
    try {
        const encodedKey = btoa(req.params.key)
        // console.log(req.params.key)
        const headers = {
            Authorization: `Basic ${encodedKey} `,
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/json'
        }
        const contactsUrl = 'https://api.na1.insightly.com/v3.1/contacts'
        const contacts = await axios.get(contactsUrl, { headers })
        function AddContacts(CONTACT_ID,FIRST_NAME, LAST_NAME, EMAIL_ADDRESS) {
            this.CONTACT_ID=CONTACT_ID;
            this.FIRST_NAME = FIRST_NAME;
            this.LAST_NAME = LAST_NAME;
            this.EMAIL_ADDRESS = EMAIL_ADDRESS
        }
        
        var contactsArr = []
        for (let i = 0; i<contacts.data.length; i++) {
            contactsArr.push(new AddContacts(
                contacts.data[i].CONTACT_ID,
                contacts.data[i].FIRST_NAME,
                contacts.data[i].LAST_NAME,
                contacts.data[i].EMAIL_ADDRESS
            ))
        }
    
        res.send(contactsArr) 
     
    } catch (error) {
        res.send(null)
    }
    })


//===============to get contact to prefill edit form=============
app.post("/server/singleContact/:contactid",async(req,res)=>{
    
      const contactID=req.params.contactid
    const encodedKey=btoa(req.body.body)
    const headers = {
        Authorization: `Basic ${encodedKey} `,
        'Accept-Encoding': 'gzip',
        'Content-Type': 'application/json'
    }

    const preFillContact=await axios.get(`https://api.na1.insightly.com/v3.1/Contacts/${contactID}`,{ headers })
   function AddContacts(FIRST_NAME, LAST_NAME, EMAIL_ADDRESS) {
      this.FIRST_NAME = FIRST_NAME;
        this.LAST_NAME = LAST_NAME;
        this.EMAIL_ADDRESS = EMAIL_ADDRESS
    }
    
    
    var contactArr = []
    
        contactArr.push(new AddContacts(
    
            preFillContact.data.FIRST_NAME,
            preFillContact.data.LAST_NAME,
            preFillContact.data.EMAIL_ADDRESS
        ))
      res.send(contactArr) 

})



//==========to get all contacts
app.put("/server/updateContact/:contactid",async (req,res)=>{
    try {
           
        const encodedKey=btoa(req.body.body.api)
        const headers ={
            Authorization: `Basic ${encodedKey} `,
                 'Accept-Encoding': 'gzip',
                 'Content-Type':'application/json',    
             }
            var body={ 
                CONTACT_ID:req.params.contactid, //requires cid to update
                FIRST_NAME:req.body.body.FIRST_NAME,
                LAST_NAME:req.body.body.LAST_NAME,
                EMAIL_ADDRESS:req.body.body.EMAIL_ADDRESS
            }
      
    
             const resp = await axios.put('https://api.na1.insightly.com/v3.1/contacts/',body,{ headers })
             res.send(JSON.stringify("updated"))
       
    } catch (error) {
        if(error.response.status==400){
            res.send(JSON.stringify("Data invalidation! 'Contact First Name' cannot be empty"))
        }
        else if(error.response.status==401)
        {
            res.send(JSON.stringify("Invalid Api Key"))
        }
        else if(error.response.status==402){
            res.send(JSON.stringify("Record limit reached"))
        }
    }   
    
    })


//==============to create a contact===================
    app.post("/server/createContact",async(req,res)=>{
        try {
            const encodedKey=btoa(req.body.body.apiKey)
        const headers ={
            Authorization: `Basic ${encodedKey} `,
                 'Accept-Encoding': 'gzip',
                 'Content-Type':'application/json',   
             }
            var body={ 
              
                FIRST_NAME:req.body.body.FIRST_NAME,
                LAST_NAME:req.body.body.LAST_NAME,
                EMAIL_ADDRESS:req.body.body.EMAIL_ADDRESS
            }
      
             const resp = await axios.post('https://api.na1.insightly.com/v3.1/contacts',body,{ headers })
             res.send(JSON.stringify("New contact has been created"))
            
        } catch (error) {
            
            if(error.response.status==400){
                res.send(JSON.stringify("Data invalidation! 'Contact First Name' cannot be empty"))
            }
            else if(error.response.status==401)
            {
                res.send(JSON.stringify("Invalid Api Key"))
            }
            else if(error.response.status==402){
                res.send(JSON.stringify("Record limit reached"))
            }
        }
        
    })

//=====to delete a contact===========================

app.post("/server/deleteConatct/:contactid", async (req,res)=>{
    try {
        console.log(req.body.body)
        const encodedKey=btoa(req.body.body)
        const headers ={
            Authorization: `Basic ${encodedKey} `,
                 'Accept-Encoding': 'gzip',
                 'Content-Type':'application/json',   
             }
         const resp=await axios.delete(`https://api.na1.insightly.com/v3.1/Contacts/${req.params.contactid}`,{ headers })
        //  console.log(resp)  
         res.send(JSON.stringify("successfully deleted"))
    } catch (error) {
        console.log(error)
        if(error.response.status==401){
            res.send(JSON.stringify("Authentication failed"))
        }
        else if(error.response.status==403){
            res.send(JSON.stringify("API User does not have access to Record."))
        }
        else if(error.response.status==404){
            res.send(JSON.stringify("Record not found"))
        }
        else if(error.response.status==417){
            res.send(JSON.stringify("Delete failed"))
        }
        
    }
})















port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`app is running on ${port}`)
})