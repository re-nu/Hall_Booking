import express, { application } from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import {ObjectId} from 'bson'

dotenv.config();

const app=express();

const PORT=process.env.PORT;  //hide port becz heroku will start on wthich ever port is empty

app.use(express.json());   //middleware for all body data to json

const MONGO_URL=process.env.MONGO_URL;  //to hide passward from mongo url from atlas

// connect to mongodb
async function CreateConnection() {
    const client=new MongoClient(MONGO_URL);
    await client.connect();
    console.log("Mongodb Connected")
    return client;
}

// to have connection globaly available
const client= await CreateConnection();

// hame page ulr
app.get("/",(request,response)=>{
    response.send("Hall Booking");
});

// to get all rooms  toArray becz .find returns curser(pagenation)
app.get("/rooms",async(request,response)=>{
    const data= await client.db("b28wd").collection("rooms").find({}).toArray();
    response.send(data);
})

// create db "b28ws" with rooms collections and insert many rooms as document 
app.post("/rooms",async(request,response)=>{
    const data=request.body;
    const result=await client.db("b28wd").collection("rooms").insertMany(data);
    response.send(result);
})

// get just booked rooms with perticular fields i.e projections
app.get("/booked-rooms",async(request,response)=>{
    const filter={status:"booked"}

    const result=await client.db("b28wd").collection("rooms").find(filter,{projection:{amenities:0,seats:0,price:0}}).toArray();
    response.send(result);
})

// get all rooms with customers details
app.get("/customers",async(request,response)=>{


    const result=await client.db("b28wd").collection("rooms").find({},{projection:{customer:1,name:1}}).toArray();
    response.send(result);
})

// get room by _id
app.get("/room/:id",async(request,response)=>{
    const{id}=request.params;

    const result= await getRoomById(id)
    response.send(result)
})

// to book room by _id
app.put("/room/:id",async(request,response)=>{
    const{id}=request.params;
    // get room by id to check room is available/booked
    const room= await getRoomById(id)
    console.log(room);

    // check if booked
    if(room.status==="booked"){
        response.send({message:`Room _id :${id} is already booked`})
    }

    else{
        // add customer details eg {"name":"Leo","date":"3/12/2021","start-time":"9am","end-time":"1pm"}
        const customer_data=request.body
        // update data and chang status to booked
     const result= await client.db("b28wd").collection("rooms").updateOne({_id:ObjectId(id)},{$set:{customer:customer_data,status:"booked"}})
     response.send(room);
    }
})

app.listen(PORT,()=>console.log("App is started in :",PORT));

async function getRoomById(id) {
    return await client.db("b28wd").collection("rooms").findOne({ _id: ObjectId(id) });
}

