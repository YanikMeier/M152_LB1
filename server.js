const express = require('express');
const multer = require('multer');
const path = require('path');
const gm = require('gm');
const ejs = require('ejs');
const fs = require('fs');
const fluent_ffmpeg = require('fluent-ffmpeg');






const storage = multer.diskStorage({
    destination: './file/',
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const storageVideos = multer.diskStorage({
    destination: './video/',
    filename: function (req, video, cb) {
        cb(null, video.originalname)
    }
});


const upload = multer({
    storage: storage
}).single('file');

const uploadm = multer({
    storage: storage
}).array('files', 20);


const uploadVideos = multer({
    storage: storageVideos
}).array('video', 20);

const app = express();

function updateImages() {

    return fs.readdirSync('./file');
}


app.set('view engine', 'ejs');


app.use('/file', express.static(path.join(__dirname, 'file')));


app.post('/api/file', function (req, res) {
    upload(req, res, function (err) {
        gm(req.file.path)
            .resize(720, null)
            .write('./file/' + 'small_' + (req.file.originalname), function (err) {
                if (err) console.log(err);
                else console.log('Done with small!');

            });
        gm(req.file.path)
            .resize(1280, null)
            .write('./file/' + 'medium_' + (req.file.originalname), function (err) {
                if (err) console.log(err);
                else console.log('Done with medium!');

            });
        gm(req.file.path)
            .resize(1920, null)
            .write('./file/' + 'big_' + (req.file.originalname), function (err) {
                if (err) console.log(err);
                else console.log('Done with big!');

            });
        if (err) {
            res.render('image_gallery', {
                msg: err,


            });
        }
        else {
            res.render('image_gallery', {
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
                .write('./file/' + 'small_' + (req.files[i].originalname), function (err) {
                    if (err) console.log(err);
                    else console.log('Done with small!');

                });
            gm(req.files[i].path)
                .resize(1280, null)
                .write('./file/' + 'medium_' + (req.files[i].originalname), function (err) {
                    if (err) console.log(err);
                    else console.log('Done with medium!');

                });
            gm(req.files[i].path)
                .resize(1920, null)
                .write('./file/' + 'big_' + (req.files[i].originalname), function (err) {
                    if (err) console.log(err);
                    else console.log('Done with big!');

                });
        }
    });
});

app.post('/api/videos', function (req, res) {
    uploadVideos(req, res, function (err) {
        const name = req.body.video + '.mp4';
        var mergedVideo = fluent_ffmpeg();
        var videoNames = req.files;

        {
            videoNames.forEach(function(videoName){
                mergedVideo = mergedVideo.addInput(videoName.path)
            });

            mergedVideo.mergeToFile('./video/' + name)
                .on('error', function (err) {
                    console.log('Error ' + err.message);
                })
                .on('end', function(){
                    console.log('Finished!');
                });

        }
        res.status(200).send("done")
    });


});

app.get('/', (req, res) => {
    res.render('image_gallery', {
        images: updateImages()
    })
});

const port = 4000;

app.listen(process.env.PORT || port, () => console.log('server started on port ${port}'));


app.get('/gallery/image', function (req, res) {
    res.render('image_gallery')
});

app.get('/video_manager', function (req, res) {
    res.render('video_manager')
});

app.get('/images', function (req, res) {
    res.render('gallery', {
        original: fs.readdirSync(+'/file/'),
    })

});

