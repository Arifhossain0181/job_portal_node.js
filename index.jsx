const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000

app.use(cors());
app.use(express.json());

// DB_USER = job_hunter
//DB_PASS =job_hunter
//${process.env.DB_USER}:${process.env.DB_PASS}


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri =  "mongodb+srv://job_hunter:job_hunter@co.sb0kq7l.mongodb.net/?retryWrites=true&w=majority&appName=Co";
;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // jobs related aPis
    const jobscollection = client.db('Jobportal').collection('jobs');
    const jobaPPlictioncollection = client.db('Jobportal').collection('job-aPPlication');
    
    app.get('/jobs' ,async(req,res) =>{
      const email = req.query.email;
      let query = {}
      if(email){
        query = {hr_email: email}
      }
        const cursor = jobscollection.find(query);
        const result = await cursor.toArray();
        res.send(result)

    });
    app.get('/jobs/:id',async (req,res) =>{
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id)}
      const result = await jobscollection.findOne(qurey);
      res.send(result)

    });
      // job create PosT 
      app.post('/jobs', async (req,res) =>{
        const newjobs = req.body;
        const result = await jobscollection.insertOne(newjobs);
        res.send(result)

      })


    //jobaPPliction aPPly 
    // get all data, get one data, get some data [0,1, many]

    app.get('/job-aPPlication',async (req,res) =>{
      const email = req.query.email;
      const query = {aPPlication_email: email};
      const result = await jobaPPlictioncollection.find(query).toArray();
      // fokira way to aggrete 
      for(const aPPlication of result){
        console.log(aPPlication.job_id);
        const query1 = {_id: new ObjectId(aPPlication.job_id)}
        const job = await jobaPPlictioncollection.findOne(query1);
        if(job){
          aPPlication.title = job.title;
          aPPlication.company_logo = job.company_logo;
          aPPlication.location = job.location;
          

        }
      }

      res.send(result)
    });

    app.get('/job-aPPlication/jobs/:job_id' , async (req,res) =>{
      const jobId = req.params.job_id;
      const qurey = {job_id: jobId};
      const result = await jobaPPlictioncollection.find(qurey).toArray();
    })

    app.post('/job-aPPlication' ,async( req,res) =>{
      const aPPlication = req.body;
      const  result = await jobaPPlictioncollection.insertOne(aPPlication);
      // not the best way 
      //skiP it 
      const id = aPPlication.job_id;
      const query = {_id: new ObjectId(id)}
      const job = await jobscollection.findOne(query)
      let newcount = 0;
      if(job.aPPlicationcount){
        count =job.aPPlicationcount + 1;
      }
      else{
        newcount =1;
      }
      //now uPdate the filter job info
      const filter ={_id:new ObjectId(id)};
      const updateDoc ={
        $set:{
          aPPlicationcount: newcount
        }
      }
      const updateresult =await jobscollection.updateOne(filter,updateDoc); 
      res.send(result)

    })




  } finally {
    // Ensures that the client will close when you finish/error
  //  await client.close();
  }
}
run().catch(console.dir);



app.get('/' ,(req,res) =>{
    res.send("Job is falling form the sky ")

})
app.listen(port ,() =>{
    console.log(`job is waiting at :${port}`)
})