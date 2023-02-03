const express = require("express");
const sql = require("mssql");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const sharp = require('sharp');

const app = express();

// config for your database
const config = {
  user: "astroaimluser2023",
  password: "kL{>Oy.gWASY#|Pr",
  server: "185.136.157.11",
  port: 1433, // default port for SQL Server
  database: "astroaiml2023",
  options: {
    encrypt: false, // disable TLS for the connection
  },
};
// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png"||file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(cors());

// Initialize multer middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

// Set up the route to handle image uploads
// app.post("/api/upload-image", upload.single("image"), (req, res) => {
//   // The uploaded image is available in req.file
//   if (!req.file) {
//     return res.status(400).send("No image was uploaded");
//   }
//   res.send(`/images/uploads/${req.file.originalname}`);
// });

// app.post("/api/upload-image", upload.single("image"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).send("No image was uploaded");
//   }
//   sharp(req.file.path)
//     .resize(800)
//     .toFile(`./images/uploads/${req.file.originalname}`, (err, info) => {
//       if (err) {
//         console.log(err);
//         return res.status(500).send(err);
//       }
//       res.send(`/images/uploads/${req.file.originalname}`);
//     });
// });
app.post("/api/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No image was uploaded");
  }

  const fileName = req.file.originalname;
  const ext = fileName.substr(fileName.lastIndexOf("."));
  const compressedFileName = fileName.substr(0, fileName.lastIndexOf(".")) + "_compressed" + ext;
  
  sharp(req.file.path)
    .resize(800)
    .toFile(`./images/uploads/compressed/${compressedFileName}`, (err, info) => {
      if (err) {
        console.log(err);
        return res.status(500).send("An error occurred while compressing the image");
      }
      res.send(`/images/uploads/compressed/${compressedFileName}`);
    });
});

app.post("/api/call-stored-procedure", (req, res) => {
  const procedureName = req.body.procedureName;
  const input1 = req.body.input1;
  const input2 = req.body.input2;

  // Validate input values
  if (!procedureName) {
    return res
      .status(400)
      .send('Required parameter "procedureName" is missing');
  }

  // Call stored procedure
  sql.connect(config, (err) => {
    if (err) console.log(err);

    const request = new sql.Request();
    request.input("Condition", sql.VarChar(50), input1);
    request.input("Jsonstring", sql.NVarChar(sql.MAX), input2);
    request.execute(procedureName, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred");
      } else {
        res.send(result);
      }
    });
  });
});
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Server is listening on port ${port}`);
});
