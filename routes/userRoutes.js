const express = require("express");
const multer = require('multer');
const validateAccessToken=require("../models/validation")
const { register,login, upload1,getfiles, getFileController } = require("../controllers/userConrollers");
const router = express.Router();
router.post("/register",register)
router.post("/login", login);
router.post("/upload", multer({ storage: multer.memoryStorage() }).single('file'),validateAccessToken, upload1);
router.post("/getfiles", validateAccessToken, getfiles);
router.get("/file/:fileId",validateAccessToken,getFileController)
module.exports = router;
