const express = require('express');
const mongoose = require('mongoose');
const userSchema = require('./models/user');
const bcrypt = require('bcrypt');
const path = require('path');
const jwt=require("jsonwebtoken")
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

mongoose.connect('mongodb://127.0.0.1:27017/LOOG', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './views/index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, './views/register.html'));
});
app.post('/register', async (req, res) => {
  
  try {
    const { name, email, age, password } = req.body;
    const user = await userSchema.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userSchema.create({
      name: name,
      email: email,
      age: age,
      password: hashedPassword
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error on creating user' });
  }
});
app.post("/login",async(req,res)=>{
  const {email,password}=req.body;
  const user=await userSchema.findOne({email:email});
  if(!user){
    return res.status(401).json({message:"Invalid user"})
  }
  if(!bcrypt.compareSync(password,user.password)){
    return res.status(401).json({message:"invalid password"})

  }
  const token =jwt.sign({userId:user._id},"SECRET_KEY");
  res.cookie("token", token); // Set the token as a cookie
  res.redirect("/dashboard"); 
})


app.get("/dashboard",(req,res)=>{
  const token = req.cookies.token;
  try{
    if(!token){
      return res.status(401).json({message:"authentication required"})

    }
    const decoded =jwt.verify(token,"SECRET_KEY")
    const userId=decoded.userId;
    if(userId){
      res.sendFile(path.join(__dirname, './views/dashboard.html'));
    }else{
      return res.status(403).json({message:"invalid"})
    }
  }catch(err){
    return res.status(500).json({message:"server error"})
  }
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});