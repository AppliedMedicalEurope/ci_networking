const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const upload = multer({ dest: uploadDir });

app.use('/files', express.static(uploadDir));

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

app.listen(PORT, () => console.log(\`Listening on http://localhost:\${PORT}\`));
