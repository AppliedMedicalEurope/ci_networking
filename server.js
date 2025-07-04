const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // preserves original name
  }
});
const upload = multer({ storage });


const mime = require('mime');
app.get('/files/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }
  const contentType = mime.getType(filePath) || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  res.sendFile(filePath);
});


app.post('/upload', upload.single('file'), (req, res) => {
  res.send(`Uploaded! <a href="/files/${req.file.filename}">Download</a>`);
});

app.get('/', (req, res) => {
  const list = fs.readdirSync(uploadDir)
    .map(f => `<li><a href="/files/${f}">${f}</a></li>`).join('');
  res.send(`
    <h2>File Uploader</h2>
    <form method="POST" enctype="multipart/form-data" action="/upload">
      <input name="file" type="file" required>
      <button>Upload</button>
    </form>
    <ul>${list}</ul>
  `);
});

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));

