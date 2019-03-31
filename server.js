const express = require('express');
const multer = require('multer');
const path = require('path');
const gm = require('gm');
const ejs = require('ejs');


const storage = multer.diskStorage({
    destination: './public/file/',
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});


const upload = multer({
    storage: storage
}).single('file');

const uploadm = multer({
    storage: storage
}).array('files', 20);

const app = express();

function updateImages() {

    return fs.readdirSync('./file');
}


app.set('view engine', 'ejs');


app.use(express.static('./public'));

<<<<<<< HEAD

=======
>>>>>>> f0bde1ac5cd9ba6aed75417cc550be4753aa1c44
app.post('/api/file', function (req, res) {
    upload(req, res, function (err) {
        gm(req.file.path)
            .resize(720, null)
            .write('./public/file/' + 'small_' + (req.file.originalname), function (err) {
                if (err) console.log(err);
                else console.log('Done with small!');

            });
        gm(req.file.path)
            .resize(1280, null)
            .write('./public/file/' + 'medium_' + (req.file.originalname), function (err) {
                if (err) console.log(err);
                else console.log('Done with medium!');

            });
        gm(req.file.path)
            .resize(1920, null)
            .write('./public/file/' + 'big_' + (req.file.originalname), function (err) {
                if (err) console.log(err);
                else console.log('Done with big!');

            });
        if (err) {
            res.render('index', {
                msg: err,


            });
        }
        else {
            res.render('index', {
                file: `/api/file${req.file.filename}`,
                images: updateImages()
            })
        }
    });
});


app.post('/api/files', function (req, res) {

    uploadm(req, res, function (err) {
        console.log(req.files);
        for (var i = 0; i < req.files.length; i++) {
            gm(req.files[i].path)
                .resize(720, null)
                .write('./public/file/' + 'small_' + (req.files[i].originalname), function (err) {
                    if (err) console.log(err);
                    else console.log('Done with small!');

                });
            gm(req.files[i].path)
                .resize(1280, null)
                .write('./public/file/' + 'medium_' + (req.files[i].originalname), function (err) {
                    if (err) console.log(err);
                    else console.log('Done with medium!');

                });
            gm(req.files[i].path)
                .resize(1920, null)
                .write('./public/file/' + 'big_' + (req.files[i].originalname), function (err) {
                    if (err) console.log(err);
                    else console.log('Done with big!');

                });
        }
    });


});

app.get('/', (req, res) => {
    res.render('index');
});

const port = 4000;

app.listen(process.env.PORT || port, () => console.log('server started on port ${port}'));


app.get('/gallery/image', function (req, res) {
    res.render('gallery_image', {
        original: fs.readdirSync(dirname + '/public/file/'),

    })
});
