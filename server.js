const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage
}).single('myImage');


// Init app
const app = express();

// Public Folder
app.use(express.static('./public'));


app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if(err){
            res.render('index', {
                msg: err
            });
        }else {
            console.log(req.file);
            res.send('test');
        }
    });    
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
    
const port = 3000;

app.listen(port, () => console.log('server started on port ${port}'));



