const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');
const gm = require('gm');
const ejs = require('ejs');
const fs = require('fs');
const fluent_ffmpeg = require('fluent-ffmpeg');

const port = 4000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    wss.clients
        .forEach(function (client) {
            client.send(JSON.stringify({
                user: "server",
                text: 'Neuer User ist dem Chat beigetretten!',

            }));
        });

        //connection is up, let's add a simple simple event
        ws.on('message', function (message) {
            //log the received message and send it back to the client
            console.log('received: %s', message);
            wss.clients
                .forEach(function (client) {
                    if (client != ws) {
                        client.send(message);
                    }
                    else {
                        ws.send(message);
                    }
                });
        });
    });



//start our server
    server.listen(process.env.PORT || 80, () => {
        console.log(`Server started on port ${server.address().port} :)`);
    });






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

var nameOfAudio = '';

const storageAudio = multer.diskStorage({
    destination: './audio/',
    filename: function (req, file, cb) {
        let filetype = file.fieldname;
        if(filetype === 'audio') {
            nameOfAudio = file.originalname.split('.').slice(0, -1).join('.');
            console.log(nameOfAudio);
            cb(null, file.originalname);
        }
        else if(filetype === 'vtt'){
            file.originalname = nameOfAudio + '.vtt';
            cb(null, file.originalname);
        }
    }
});

const upload = multer({
    storage: storage
}).single('file');

const uploadM = multer({
    storage: storage
}).array('files', 20);

const uploadVideos = multer({
    storage: storageVideos
}).array('video', 20);


const uploadAudio = multer({
    storage: storageAudio
}).any();



function updateImages() {

    return fs.readdirSync('./file');
}

app.set('view engine', 'ejs');

app.use('/file', express.static(path.join(__dirname, 'file')));
app.use('/audio', express.static(path.join(__dirname, 'audio')));
app.use('/video/merged/', express.static(path.join(__dirname, '/video/merged/')));

//POST Single File
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

//POST Multiple Files
app.post('/api/files', function (req, res) {

    uploadM(req, res, function (err) {
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

//POST Video
app.post('/api/videos', function (req, res) {
    uploadVideos(req, res, function (err) {
        if (err) {
            res.render('video_manager', {
                msg: err,
            });
        }
        else {
            const name = req.body.video + '.mp4';
            var mergedVideo = fluent_ffmpeg();
            var videoNames = req.files;
            videoNames.forEach(function (videoName) {
                mergedVideo = mergedVideo.addInput(videoName.path)
            });

            mergedVideo.mergeToFile('./video/merged/' + name)
                .on('error', function (err) {
                    console.log('Error ' + err.message);
                })
                .on('end', function () {
                    console.log('Finished!');
                });

            var fileName = req.query.videoName;
            res.render('play_video', {

                video: fs.readdirSync(__dirname + '/video/merged').filter(function (file) {
                    return file === fileName;
                })
            });
        }
    });


});

//Post Audio
app.post('/api/audio', function (req, res) {
    uploadAudio(req, res, function (err) {
        if (err) {
            res.render('audio_manager', {
                msg: err,
            });
        }
        else {
            res.status(200).send("okidoki");
            console.log(req.files);
        }
    });
});


//Post VTT


//app.listen(process.env.PORT || port, () => console.log('server started on port ${port}'));

app.get('/', (req, res) => {
    res.render('image_gallery', {
        images: updateImages()
    })
});


app.get('/gallery/image', function (req, res) {
    res.render('image_gallery')
});

app.get('/webchat', function (req, res) {
    res.render('webchat')
});

app.get('/video_manager', function (req, res) {
    res.render('video_manager')
});

app.get('/play_vid', function (req, res) {
    res.render('video_manager')
});

app.get('/images', function (req, res) {
    res.render('gallery', {
        original: fs.readdirSync(+'/file/'),
    })
});

app.get('/audio_manager', function (req, res) {
    res.render('audio_manager')
});

app.get('/play_video', function (req, res) {
    console.log(req.query.videoName);
    var fileName = req.query.videoName;
    res.render('play_video', {
        video: fs.readdirSync(__dirname + '/video/merged').filter(function (file) {
            return file === fileName;
        })
    });
});


app.get('/audio-player', function (req, res) {
    console.log(req.query.audioName);
    var fileName = req.query.audioName.split('.').slice(0, -1).join('.');
    res.render('audio-player', {
        audio: fileName
    });
})








