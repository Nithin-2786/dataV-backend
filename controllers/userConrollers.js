const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/usermodel");
const {uploadFile,getFileFromDrive} = require("../googledriveservices");
const { Readable } = require('stream');

// Register User
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }

  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User email already exists");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  console.log("Hashed Password: ", hashPassword);

  const user = await User.create({
    username,
    email,
    password: hashPassword
  });
  
  if (user) {
    return res.status(201).json({
      _id: user.id,
      email: user.email,
      message: "User registered successfully"
    });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
});

// Login User
const login = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    const accesstoken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
          type: user.userType,
          base64: user.base64
        }
      },
      process.env.ACCESSTOKENSECRET,
    );

    res.json({ accesstoken });
  } else {
    res.json({ message: "Invalid username or password" });
  }
});

// Upload File with Access Token
const upload1 = asyncHandler(async (req, res) => {
    const file = req.file;
  
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }
  
    try {
      // Check if a file with the same name already exists for the user
      const user = await User.findById(req.user.id);
      const fileExists = user.files.some(f => f.filename === file.originalname);
  
      if (fileExists) {
        return res.status(400).send('A file with this name already exists.');
      }
  
      // Create a readable stream from the uploaded file buffer
      const fileStream = new Readable();
      fileStream.push(file.buffer);
      fileStream.push(null);
  
      // Upload the file to Google Drive and get the file ID
      const fileid1 = await uploadFile(fileStream, file.originalname);
      console.log("driveres:", fileid1);
  
      // Construct the file object to be saved in the user's document
      const fileObject = { filename: file.originalname, fileId: fileid1 };
  
      // Update the user's document to include the new file object
      await User.findByIdAndUpdate(req.user.id, {
        $push: { files: fileObject }
      });
  
      // Send a success response with the file ID
      return res.json({ message: 'File uploaded successfully to Google Drive!', file: fileObject });
    } catch (error) {
      console.error(error.message);
      return res.status(500).send('Failed to upload file to Google Drive.');
    }
  });
// Get Files
const getfiles = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ files: user.files });
  } catch (error) {
    res.status(500).send('Failed to retrieve files.');
  }
});
const getFileController = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
  
    try {
      // Assuming you have a function to get file from Google Drive by ID
      const fileStream = await getFileFromDrive(fileId);
  
      fileStream.pipe(res);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Failed to fetch file');
    }
  });
  
  module.exports = { 
    register,
    login,
    getfiles,
    getFileController,
    upload1 
  };
