const express = require('express');
const multer = require('multer');
const path = require('path');
const gm = require('gm');

const storage = multer.diskStorage({
    destination: './public/files/',
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({
    storage: storage
}).single('');

const app = express();

app.use(express.static('./public'));

app.post('/api/file', function (req, res) {
    upload(req, res, function (err) {
        gm(req.file.path)
            .resize(720, 720)
            .write('./public/files/' + 'small_' + (req.file.originalname), function (err) {
                if (err) {
                    console.log(err)
                }
                else {
                    //console.log(err)
                }
            });
        gm(req.file.path)
            .resize(1280, 1280)
            .write('./public/files/' + 'medium_' + (req.file.originalname), function (err) {
                if (err) {
                    console.log(err)
                }
                else {
                    //console.log(err)
                }
            });
        gm(req.file.path)
            .resize(1920, 1920)
            .write('./public/files/' + 'big_' + (req.file.originalname), function (err) {
                if (err) {
                    console.log(err)
                }
                else {
                    //console.log(err)
                }
            });

        if (err) {
            res.render('index', {
                msg: err
            });
        } else {
            console.log(req.file);
            res.send('upload sucsessfull');
        }
    });
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const port = 4000;

app.listen(process.env.PORT || port, () => console.log('server started on port ${port}'));



