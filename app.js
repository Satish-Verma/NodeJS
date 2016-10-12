
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , fs = require('fs');
//could be/remain at top of file
var http = require('http');
const im = require('imagemagick-stream');

var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var errorHandler = require('errorhandler');

var storagePathImages = 'f:/uploads/images/';
var storagePathVideos = 'f:/uploads/videos/';
var storagePathDocs = 'f:/uploads/docs/';
var PDFImage = require("pdf-image").PDFImage;

var thumbler = require('video-thumb');


var storageImages =   multer.diskStorage({
	  destination: function (req, file, callback) {
	    callback(null, storagePathImages);
	  },
	  filename: function (req, file, callback) {
	    callback(null, file.originalname/*file.fieldname + '-' + Date.now()*/);
	  }
	});

var uploadImages = multer({ storage : storageImages}).single('file');

var storageVideos =   multer.diskStorage({
	  destination: function (req, file, callback) {
	    callback(null, storagePathVideos);
	  },
	  filename: function (req, file, callback) {
	    callback(null, file.originalname/*file.fieldname + '-' + Date.now()*/);
	  }
	});

var uploadVideos = multer({ storage : storageVideos}).single('file');

var storageDocs =   multer.diskStorage({
	  destination: function (req, file, callback) {
	    callback(null, storagePathDocs);
	  },
	  filename: function (req, file, callback) {
	    callback(null, file.originalname/*file.fieldname + '-' + Date.now()*/);
	  }
	});

var uploadDocs = multer({ storage : storageDocs}).single('file');
	
var app = express();


app.set('port', process.env.PORT || 80);

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(methodOverride());
app.use(session({ resave: true, saveUninitialized: true, 
                  secret: 'uwotm8' }));

// parse application/json
app.use(bodyParser.json());                        

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse multipart/form-data
//app.use(multer);

app.use(express.static(path.join(__dirname, '/public')));
// development only
if ('development' == app.get('env')) {
  //app.use(errorHandler());
}

app.get('/w', routes.index);
app.get('/users', user.list);

app.post('/api/images',function(req,res){
	uploadImages(req,res,function(err) {
		console.log("file: "+req.file.originalname);
        if(err) {
            return res.end("Error uploading file."+ err);
        }
        im(storagePathImages+ req.file.originalname)
        .resize('400x300')
        .quality(90)
        .to(storagePathImages+ '400x300' +req.file.originalname+".png");
        res.end("File is uploaded");
    });
});

app.get('/uploads/images/:fileName', function(req, res) {
	  //res.send('user ' + req.params.fileName);
	  var id = req.params.fileName;
	 // res.end(storagePathImages+id);
	  fs.exists(storagePathImages+id, function(exists) {
	    if(exists) res.sendfile(storagePathImages+id)
	    else res.end('err')
	  })
	});

//get image list
app.get('/uploads/images', function(req, res) {
	res.send(fileList(storagePathImages));
	});

app.post('/api/videos',function(req,res){
        
    uploadVideos(req,res,function(err) {
		console.log("file: "+req.file.originalname);
        if(err) {
            return res.end("Error uploading file."+ err);
        }
        
        thumbler.extract(storagePathVideos+ req.file.originalname, storagePathVideos+ "400x300"+req.file.originalname+'.png', '00:00:01', '200x125', function(){

            console.log('snapshot saved to snapshot.png (200x125) with a frame at 00:00:22');

        });

        res.end("File is uploaded");
    });
});

app.get('/uploads/videos/:fileName', function(req, res) {
	  //res.send('user ' + req.params.fileName);
	  var id = req.params.fileName;
	 // res.end(storagePathImages+id);
	  fs.exists(storagePathVideos+id, function(exists) {
	    if(exists) res.sendfile(storagePathVideos+id)
	    else res.end('err')
	  })
	});

//get image list
app.get('/uploads/videos', function(req, res) {
	res.send(fileList(storagePathVideos));
	});

app.post('/api/docs',function(req,res){
    /*uploadDocs(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file."+ err);
        }*/
       
        var pdfPath = 'd:/uploads/docs/POC-Details.pdf';//storagePathDocs+req.file.originalname;
        console.log("pdf path"+pdfPath);
        var pdfImage = new PDFImage(pdfPath);
        
        pdfImage.convertPage(0).then(function (imagePath) {
        	res.end("File is uploaded: "+imagePath);
        }, function (err) {
          res.send(err, 500);
        });
        
        
   // });
});

app.get('/uploads/docs/:fileName', function(req, res) {
	  //res.send('user ' + req.params.fileName);
	  var id = req.params.fileName;
	 // res.end(storagePathImages+id);
	  fs.exists(storagePathDocs+id, function(exists) {
	    if(exists) res.sendfile(storagePathDocs+id)
	    else res.end('err')
	  })
	});

//get image list
app.get('/uploads/docs', function(req, res) {
	res.send(fileList(storagePathDocs));
	});


function fileList(dir) {
	  return fs.readdirSync(dir).reduce(function(list, file) {
		if(file.indexOf('400x300')< 0){
	    var name = path.join(dir, file);
	    var isDir = fs.statSync(name).isDirectory();
	    return list.concat(isDir ? fileList(name) : {fileName:name.split(path.sep).slice(-1)[0]});
		}else{
			return list;
		}
	  }, []);
	}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


