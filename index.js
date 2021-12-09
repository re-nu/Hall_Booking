import express, { application } from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import {ObjectId} from 'bson'

dotenv.config();

const app=express();

const PORT=process.env.PORT;

app.use(express.json());

const MONGO_URL=process.env.MONGO_URL;

async function CreateConnection() {
    const client=new MongoClient(MONGO_URL);
    await client.connect();
    console.log("Mongodb Connected")
    return client;
}

const client= await CreateConnection();

const hall=[
    {
        "name":"G001",
        "amenities":["Ac","Wi-Fi","Smart Board","Video Conferencing"],
        "seats":50,
        "price":"500/hr",
        "status":"booked",
        "customer":{
            "name":"Jhon",
            "date":"29/11/2021",
            "start-time":"9am",
            "end-time":"1pm"
        }
    },

    {
        "name":"F001",
        "amenities":["Ac","Wi-Fi","Smart Board","Video Conferencing"],
        "seats":50,
        "price":"500/hr",
        "status":"booked",
        "customer":{
            "name":"Bran",
            "date":"27/11/2021",
            "start-time":"9am",
            "end-time":"1pm"
        }
    },

    {
        "name":"F002",
        "amenities":["Ac","Wi-Fi","Smart Board","Video Conferencing"],
        "seats":50,
        "price":"500/hr",
        "status":"booked",
        "customer":{
            "name":"Daisy",
            "date":"1/12/2021",
            "start-time":"3pm",
            "end-time":"6pm"
        }
    },
    
    {
        "name":"S001",
       "amenities":["Ac","Wi-Fi","Smart Board","Video Conferencing"],
       "seats":50,
       "price":"500/hr",
       "status":"Not booked"
    },
    {
        "name":"S002",
        "amenities":["Ac","Wi-Fi","Smart Board","Video Conferencing"],
        "seats":50,
        "price":"500/hr",
        "status":"Not booked"
    },
    
    {
        "name":"T001",
        "amenities":["Ac","Wi-Fi","Smart Board","Video Conferencing"],
        "seats":50,
        "price":"500/hr",
        "status":" Not booked"
    }
]


app.get("/",(request,response)=>{
    response.send("Hall Booking");
});

app.post("/rooms",async(request,response)=>{
    const data=request.body;
    const result=await client.db("b28wd").collection("rooms").insertMany(data);
    response.send(result);
})

app.get("/booked-rooms",async(request,response)=>{
    // const filter=request.query // status=booked
    const filter={status:"booked"}

    const result=await client.db("b28wd").collection("rooms").find(filter,{amenities:0,seats:0,price:0}).toArray();
    response.send(result);
})

app.get("/room/:id",async(request,response)=>{
    const{id}=request.params;

    const result= await getRoomById(id)
    response.send(result)
})

app.put("/room/:id",(request,response)=>{
    const{id}=request.params;
    const room= await getRoomById(id)
    console.log(room);

    if(room.status==="booked"){
        response.send({message:"Room _id  is already booked"})
    }

    else{
        const customer_data=request.body
     const result= await client.db("b28wd").collection("rooms").updateOne({_id:ObjectId(id)},{$set:{customer:customer_data}})
     response.send("add customer data");
    }
})

app.listen(PORT,()=>console.log("App is started in :",PORT));

async function getRoomById(id) {
    return await client.db("b28wd").collection("rooms").findOne({ _id: ObjectId(id) });
}

