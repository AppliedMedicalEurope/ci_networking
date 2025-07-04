const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Save files using original filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');
  res.send(`File uploaded: <a href="/files/${req.file.originalname}" target="_blank">Open HTML</a>`);
});

// Serve uploaded HTML file with hardcoded Content-Type
app.get('/files/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('File read error:', err);
      return res.status(500).send('Error reading file');
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
  });
});

// Home page: upload form + list of files
app.get('/', (req, res) => {
  const files = fs.readdirSync(uploadDir);
  const listItems = files.map(file => `<li><a href="/files/${file}" target="_blank">${file}</a></li>`).join('');
  res.send(`
    <h2>Simple HTML File Uploader</h2>
    <form method="POST" action="/upload" enctype="multipart/form-data">
      <input type="file" name="file" accept=".html" required />
      <button type="submit">Upload</button>
    </form>
    <h3>Uploaded Files</h3>
    <ul>${listItems}</ul>
  `);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
