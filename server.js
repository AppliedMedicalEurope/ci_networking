const express = require('express');
const multer = require('multer');
const mime = require('mime-types'); // ✅ use mime-types
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  res.send(`File uploaded: <a href="/files/${req.file.originalname}" target="_blank">Open HTML</a>`);
});

app.get('/files/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.sendFile(filePath, {
  headers: {
    'Content-Type': 'text/html'
  }
});

});

app.get('/', (req, res) => {
  const files = fs.readdirSync(uploadDir);
  const listItems = files.map(file => `<li><a href="/files/${file}" target="_blank">${file}</a></li>`).join('');
  res.send(`
    <h2>Simple File Uploader</h2>
    <form method="POST" action="/upload" enctype="multipart/form-data">
      <input type="file" name="file" required />
      <button type="submit">Upload</button>
    </form>
    <h3>Uploaded Files</h3>
    <ul>${listItems}</ul>
  `);
});

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
