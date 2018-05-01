var express       = require('express'),
    app           = express(),
    bodyParser    = require('body-parser'),
    mongoose      = require('mongoose'),
    port          = process.env.PORT || 3000,
    passport      = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User          = require('./models/user'),
    Book          = require('./models/book'),
    Episode       = require('./models/episode'),
    View       = require('./models/view'),
    Category      = require('./models/category'),
    Genre        = require('./models/genre'),
    seedDB        = require('./seeds'),
    Rating        = require('./models/rating'),
    math          = require('mathjs'),
    fs            = require('fs'),
    multer        = require('multer'),
    theUser,numRatings,finalBookRating,localCats,localGens,userBooks, userViews,
    summedRatings = 0,
    userViewBooks = [];

//mongoose.connect('mongodb://localhost/scriblr');
//mongodb://<dbuser>:<dbpassword>@ds151169.mlab.com:51169/scriblrdb
mongoose.connect('mongodb://utkarsh:Ycombinator1*@ds151169.mlab.com:51169/scriblrdb');
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('express-session')({
  secret: "Shh. We are the productivity gods/beasts.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.set('view engine','ejs');
app.use(express.static(__dirname+'/public'));
app.use('*/css',express.static('public/css'));
app.use('*/icons',express.static('public/icons'));
app.use('*/images',express.static('public/images'));
app.use('*/js',express.static('public/js'));
app.use('*/trumbowyg',express.static('public/trumbowyg'));
app.use('*/posters',express.static('public/posters'));
app.use('*/slick',express.static('public/slick'));
app.use('*/uploads',express.static('public/uploads'));

//seedDB();

function loadUserBooks(theUser){
  Book.find({
    authorID: theUser._id
  },function(err,books){
    if(err){console.log(err);}else{
      userBooks = books;
    }
  });
}

function loadUserViews(curUserID){
  View.find({
    userID: curUserID
  },function(err,views){
    if(err){console.log(err);}else{
      userViews = views;
      userViewBooks = [];
      views.forEach(function(view){
        Book.findOne({
          _id: view.bookID
        }, function(err,book){
          if(err){console.log(err);}else{
            userViewBooks.push(book);
          }
        });
      });
    }
  });
}

function updateUserViews(){
  var bookID = '';
  var episodeNo = 0;
  var readPercent = 0;
  var bookEpisodesNo = 0;
  var newReadPercent = 0;
  if(theUser){
    View.find({
      userID: theUser._id
    }, function(err, views){
      if(err){console.log(err);}else{
        views.forEach(function(view){
          bookID = view.bookID;
          episodeNo = view.episodeNo;
          readPercent = view.percentViewed;
          Episode.find({
            bookID: bookID
          },function(err,episodes){
            if(err){console.log(err);}else{
              bookEpisodesNo = episodes.length;
              console.log('Episode no: '+episodeNo);
              console.log('Total Episodes: '+bookEpisodesNo);
              newReadPercent = math.round((episodeNo*100)/bookEpisodesNo);
              console.log(newReadPercent);
              if(newReadPercent>100){
                console.log('Read percent out of bounds');
                newReadPercent = 100;
                View.update({
                  userID: theUser._id,
                  bookID: bookID
                },{$set: {
                  episodeNo: bookEpisodesNo,
                  percentViewed: newReadPercent
                }},{upsert:true},function(err,user){
                  if(err){console.log(err);}else{
                    console.log('View record read percent updated');
                    loadUserViews(theUser._id);
                  }
                });
              }else if(readPercent!=newReadPercent){
                console.log('Percent has changed totally');
                View.update({
                  userID: theUser._id,
                  bookID: bookID
                },{$set: {
                  percentViewed: newReadPercent
                }},{upsert:true},function(err,user){
                  if(err){console.log(err);}else{
                    console.log('View record read percent updated');
                    loadUserViews(theUser._id);
                  }
                });
              }else{
                console.log('Percent remains the same');
              }
            }
          });
        });
      }
    });
  }
}

app.use(function(req,res,next){
  Book.find({},function(err,books){
    if(err){console.log(err);}else{
      books.forEach(function(book){
        // console.log(book.imageURL);
        var bookImagePath = book.imageURL;
        var bookImage = bookImagePath.split('uploads/bookImages/')[1];
        var fileUrl = 'public/uploads/bookImages/';
        var noImageUrl = req.protocol + '://' + req.get('host') + '/uploads/bookImages/noBookImage.jpg';
        var path = fileUrl + bookImage;

        fs.stat(path, function(err, stat) {
          if(err == null) {
              // console.log('Book Picture Exists');
          } else if(err.code == 'ENOENT') {
              // file does not exist

              Book.update({
                _id: book._id
              }, {$set: {imageURL: noImageUrl}}, {upsert:true}, function(err,data){
                if(err){
                  console.log(err);
                }else{
                  console.log('No Book Image Found, Cover Pic Updated.');
                }
              });

          } else {
              console.log('Some other error: ', err.code);
          }
        });

      });
      next();
    }
  });
});

Category.find({},function(err,categories){
  if(err){console.log(err);}else{
    localCats = categories;
  }
});

Genre.find({},function(err,genres){
  if(err){console.log(err);}else{
    localGens = genres;
  }
});

app.use(function(req,res,next){
  res.locals.curUser = req.user;
  res.locals.categories = localCats;
  res.locals.genres = localGens;
  res.locals.userbooks = userBooks;
  res.locals.userviewbooks = userViewBooks;
  res.locals.userviews = userViews;
  updateUserViews();
  next();
});

app.get('/',function(req,res){
  Book.find({}, function(err, books){
    if(err){
      console.log(err);
    }else{
      if(theUser){
        loadUserViews(theUser._id);
      }
      res.render('index',{books:books});
    }
  });
});

app.post('/register', function(req,res){
  var imageUrl = req.protocol + '://' + req.get('host') + '/uploads/profileImages/noimage.jpg';
  var coverImageUrl = req.protocol + '://' + req.get('host') + '/uploads/profileBannerImages/nocoverimage.png';
  newUser = new User({
    email: req.body.email,
    imageUrl: imageUrl,
    coverUrl: coverImageUrl,
    userName: req.body.username,
    penName: req.body.penname,
    gender: 'Male'
  });
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      console.log(err);
    }else{
      console.log('registered user');
      res.redirect('/');
    }
  });
});

app.post('/login', passport.authenticate('local', {
    //successRedirect: '/',
    failureRedirect: '/failBRO'

  }), function(req,res){

    console.log('hit Checkpoint');
    theUser = req.user;
    loadUserBooks(theUser);
    loadUserViews(theUser._id);
    var userImagePath = theUser.imageUrl;
    var userImage = userImagePath.split('uploads/profileImages/')[1];
    var fileUrl = 'public/uploads/profileImages/';
    var noImageUrl = req.protocol + '://' + req.get('host') + '/uploads/profileImages/noimage.jpg';
    var path = fileUrl + userImage;

    fs.stat(path, function(err, stat) {
      if(err == null) {
          // console.log('Profile Picture Exists');
      } else if(err.code == 'ENOENT') {
          // file does not exist

          User.update({
            _id: theUser._id
          }, {$set: {imageUrl: noImageUrl}}, {upsert:true}, function(err,data){
            if(err){
              console.log(err);
            }else{
              // console.log('No Profile Image Found, Profile Pic Updated.');
            }
          });

      } else {
          console.log('Some other error: ', err.code);
      }
    });

    res.redirect('/');
});

app.get('/failBRO',function(req,res){
  res.send('DAMN THAT SAD');
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

app.post('/getRating',function(req,res){
  console.log('Post request received for BookID: '+req.body.bookID);

  Book.findOne({
    _id: req.body.bookID
  }, function(err, foundBook){
    if(err){
      console.log(err);
    }else{
      console.log(foundBook);
      res.end('{"success" : "'+foundBook+'", "status" : 200}');
    }
  });
});

function SaveBookRating(bookID,numRatings){
  summedRatings = 0;
  if(numRatings==0){
    numRatings = 1;
  }
  console.log('First book, numRatings is now 1');
  Rating.find({
    bookID: bookID
  }, function(err, ratingsFound){
    if(err){
      console.log(err);
    }else{
      ratingsFound.forEach(function(selRating){
        summedRatings += parseInt(selRating.rating);
      });
      console.log('The summed ratings from all users is: '+summedRatings);
      finalBookRating = math.round((summedRatings)/(numRatings));
      console.log('Final book rating to be updated is: '+finalBookRating);
      Book.update({
        _id: mongoose.Types.ObjectId(bookID)
      }, {$set: {rating: finalBookRating}}, {upsert:true}, function(err,data){
        if(err){
          console.log(err);
        }else{
          console.log('Refreshed book rating');
        }
      });
    }
  });
}

function findRatingsAverageAndUpdate(userID, bookID, newBookRating){
  console.log('finding ratings for book: '+bookID);
  numRatings = 0;
  console.log("rating at start: "+numRatings);
  //Get Number Of Book Ratings
  Rating.find({
    bookID: mongoose.Types.ObjectId(bookID)
  }, function(err, foundRatings){
    if(err){
      console.log(err);
    }
    else{
      foundRatings.forEach(function(fndRating){
        numRatings += 1;
        console.log(numRatings);
      });
      console.log('ratings found: '+numRatings);
      console.log('new book rating is: '+newBookRating);

    //CREATE NEW OR UPDATE IF EXISTS
    //Check If User Has Rated This Book Before
    Rating.findOne({
      bookID: bookID,
      userID: userID
    },function(err,userRated){
      if(err){
        console.log(err);
      }else{
        //IF USER HAS RATED - UPDATE IT
        if(userRated){
          Rating.update({
            bookID: bookID,
            userID: userID
          }, {$set: {rating: newBookRating}}, {upsert:true}, function(err,data){
            if(err){
              console.log(err);
            }else{
              console.log('Updated new user rating to: '+newBookRating);
              //UPDATE RATING IN THE BOOK WITH AVERAGE
              SaveBookRating(bookID,numRatings);
            }
          });
        }else{
          //IF USER HASN'T - CREATE
          Rating.create({
            bookID: bookID,
            userID: userID,
            rating: newBookRating
          }, function(err,data){
            if(err){
              console.log(err);
            }else{
              console.log('Created new user rating: '+newBookRating);
              //UPDATE RATING IN THE BOOK WITH AVERAGE
              numRatings += 1;
              SaveBookRating(bookID,numRatings);
            }
          });
        }
      }
    });
    }
  });
}

app.post('/postRating',isLoggedIn,function(req,res){
  console.log('Posting rating for BookID: '+req.body.bookID+' , with rating: '+req.body.givenRating+' by user: '+req.body.theCurUserID);
  findRatingsAverageAndUpdate(req.body.theCurUserID,req.body.bookID,req.body.givenRating);
  console.log('Changed rating');
});

app.get('/logout',function(req,res){
  req.logout();
  userBooks = [];
  res.redirect('/');
});

app.get('/new',isLoggedIn,function(req,res){
  res.render('new');
});

var storage = multer.diskStorage({
  destination : function(req,file,callback){
    callback(null,'./public/uploads/bookImages');
  },
  filename : function(req,file,callback){
    var ext = file.mimetype.split('/')[1];
    callback(null,file.fieldname+'-'+Date.now()+'.'+ext);
  }
});

var upload = multer({storage : storage});

app.post('/new',upload.single('bookCover'),function(req,res){
  //Get Book Info after Saving Book
  var imageName = req.file.filename;
  var title = req.body.title;
  var description = req.body.description;
  var tags = req.body.tags.split('/');
  var tagsArr = [];
  tags.forEach(function(tag){
    tagsArr.push(tag);
  });
  var others = req.body.dropmat;
  var category = others.split('^')[0];
  var genre = others.split('^')[1];
  var language = others.split('^')[2];
  var copyright = others.split('^')[3];
  var mature = others.split('^')[4];
  var theCurUserID = others.split('^')[5];
  var fullUrl = req.protocol + '://' + req.get('host');
  var imageURL = fullUrl+'/uploads/bookImages/'+imageName;

  Book.create({
    title: title,
    authorID: theCurUserID,
    rating: 0,
    genre: genre,
    imageURL: imageURL,
    description: description,
    category: category,
    uploadDate: new Date(),
    language: language,
    isOriginal: 0,
    isMature: mature,
    copyright: copyright,
    tags: tagsArr
  },function(err,book){
    if(err){
      console.log(err);
    }else{
      console.log('added book: '+book);
      loadUserBooks(theUser);
      res.redirect('/');
    }
  });
});

app.get('/profile',isLoggedIn,function(req,res){
  res.render('profileSettings');
});

var storageProfilePic = multer.diskStorage({
  destination : function(req,file,callback){
    callback(null,'./public/uploads/profileImages');
  },
  filename : function(req,file,callback){
    var ext = file.mimetype.split('/')[1];
    callback(null,file.fieldname+'-'+Date.now()+'.'+ext);
  }
});

var uploadPic = multer({storage : storageProfilePic});

app.post('/profilePic',uploadPic.single('proPic'),function(req,res){
  var imageName = req.file.filename;
  var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/profileImages/';
  var newImageUrl = fullUrl + imageName;
  var theCurUserID = req.body.dropmat;

  User.update({
    _id: theCurUserID
  },{$set: {imageUrl: newImageUrl}}, {upsert:true}, function(err, user){
    if(err){console.log(err);}else{
      res.redirect('/profile');
    }
  });

});

var storageCoverPic = multer.diskStorage({
  destination : function(req,file,callback){
    callback(null,'./public/uploads/profileBannerImages');
  },
  filename : function(req,file,callback){
    var ext = file.mimetype.split('/')[1];
    callback(null,file.fieldname+'-'+Date.now()+'.'+ext);
  }
});

var uploadCoverPic = multer({storage : storageCoverPic});

app.post('/profileBannerPic/:id',uploadCoverPic.single('proCoverPic'),function(req,res){
  var imageName = req.file.filename;
  var fullUrl = req.protocol + '://' + req.get('host') + '/uploads/profileBannerImages/';
  var newImageUrl = fullUrl + imageName;

  User.update({
    _id: req.params.id
  },{$set: {coverUrl: newImageUrl}}, {upsert:true}, function(err, user){
    if(err){console.log(err);}else{
      res.redirect('/profile');
    }
  });

});

function loadEditor(req,res,bookID){
  Episode.findOne({
    bookID: bookID,
    episodeNo: 1
  },function(err,firstEpisode){
    if(err){console.log(err);}else{
      console.log(firstEpisode);
      res.redirect('/editor/'+bookID+'/'+firstEpisode._id);
    }
  });
}

app.get('/editor/:id',isLoggedIn,function(req,res){
  var bookID = req.params.id;
  var authorID = theUser._id.toString();
  Book.findOne({
    _id: bookID
  },function(err,book){
    if(err){console.log(err);}else{
      if(book.authorID == authorID){
        console.log('This is your book');
        Episode.find({
          bookID: bookID
        },function(err,episode){
          if(err){console.log(err);}else{
            console.log('Episodes found for this book: '+episode.length);
            if(episode.length == 0){
              Episode.create({
                bookID: bookID,
                title: '',
                episodeNo: 1,
                views: 0,
                isPublished: false
              },function(err,episode){
                if(err){console.log(err);}else{
                  loadEditor(req,res,bookID);
                }
              });
            }else{
              loadEditor(req,res,bookID);
            }
          }
        });
      }else{
        console.log('This book does not belong to you');
        res.redirect('/');
      }
    }
  });
});

app.get('/editor/:id/:epid',isLoggedIn,function(req,res){
  var bookID = req.params.id;
  var episodeID = req.params.epid;
  Episode.findOne({
    _id: episodeID
  },function(err,episode){
    console.log('Episode found: '+episode);
    Episode.find({
      bookID: bookID
    },function(err, episodes){
      res.render('editor',{bookID:bookID,episode:episode,episodes:episodes});
    });
  });
});

app.post('/sectionTitle',isLoggedIn,function(req,res){
  var bookID = req.body.bookID;
  var secID = req.body.secID;
  var secTitle = req.body.sectionTitle;

  Episode.update({
    _id: secID
  }, {$set: {title: secTitle}}, {upsert:true}, function(err,data){
    if(err){console.log(err);}else{
      console.log('Updated episode title');
      res.end('{"success" : "'+data+'", "status" : 200}');
    }
  });

});

app.post('/sectionContent',isLoggedIn,function(req,res){
  var bookID = req.body.bookID;
  var secID = req.body.secID;
  var secCont = req.body.sectionContent;

  Episode.update({
    _id: secID
  }, {$set: {content: secCont}}, {upsert:true}, function(err,data){
    if(err){console.log(err);}else{
      console.log('Updated episode content');
      res.end('{"success" : "'+data+'", "status" : 200}');
    }
  });

});

app.get('/deleteEpisode/:id/:epiID',isLoggedIn,function(req,res){
  var bookID = req.params.id;
  var episodeID = req.params.epiID;

  Episode.find({
    bookID: bookID
  },function(err,episodes){
    if(err){console.log(err);}else{
      if(episodes.length==1){
        Episode.remove({
          _id: episodeID
        },function(err){
          if(err){console.log(err);}else{
            res.redirect('/');
          }
        });
      }else{
        Episode.remove({
          _id: episodeID
        },function(err){
          if(err){console.log(err);}else{
            loadEditor(req,res,bookID);
          }
        });
      }
    }
  });
});

app.get('/newSection/:id/:lastEpiNo',isLoggedIn,function(req,res){
  var bookID = req.params.id;
  var lastEpisodeNo = parseInt(req.params.lastEpiNo);
  var newEpisodeNo = lastEpisodeNo + 1;

  Episode.create({
    bookID: bookID,
    title: '',
    episodeNo: newEpisodeNo,
    views: 0,
    isPublished: false
  },function(err,episode){
    if(err){console.log(err);}else{
      res.redirect('/editor/'+bookID+'/'+episode._id);
    }
  });

});

app.post('/publishEpisode',isLoggedIn,function(req,res){
  var bookID = req.body.bookID;
  var secID = req.body.secID;

  Episode.update({
    _id: secID
  }, {$set: {isPublished: true, datePublished: new Date()}}, {upsert:true}, function(err,data){
    if(err){console.log(err);}else{
      console.log('Published episode');
      res.end('{"success" : "'+data+'", "status" : 200}');
    }
  });

});

app.post('/unpublishEpisode',isLoggedIn,function(req,res){
  var bookID = req.body.bookID;
  var secID = req.body.secID;

  Episode.update({
    _id: secID
  }, {$set: {isPublished: false}}, {upsert:true}, function(err,data){
    if(err){console.log(err);}else{
      console.log('Unpublished episode');
      res.end('{"success" : "'+data+'", "status" : 200}');
    }
  });

});

app.get('/reader/:id/:episodeNo',function(req,res){
  var bookID = req.params.id;
  var episodeNo = req.params.episodeNo;
  var userID;
  var bookEpisodesNo = 0;
  var readPercent = 0;

  Episode.find({
    bookID: bookID
  }, function(err,episodes){
    if(err){console.log(err);}else{
      bookEpisodesNo = episodes.length;
      console.log('Total book episodes: '+bookEpisodesNo);
      console.log('Current episode: '+episodeNo);
    }
  });

  if(theUser){
    userID = theUser._id;
    View.findOne({
      userID: userID,
      bookID: bookID
    }, function(err,episode){
      if(err){console.log(err);}else{
        if(episode==null){
          console.log('No views found');
          readPercent = math.round(((episodeNo * 100)/bookEpisodesNo));
          console.log('Read percent'+readPercent);
          View.create({
            userID: userID,
            bookID: bookID,
            episodeNo: episodeNo,
            percentViewed: readPercent
          },function(err,episode){
            if(err){console.log(err);}else{
              console.log('View recorded');
              loadUserViews(theUser._id);
            }
          });
        }else{
          console.log('View found');
          if(episode.episodeNo < episodeNo){
            readPercent = math.round(((episodeNo * 100)/bookEpisodesNo));
            View.update({
              userID: userID,
              bookID: bookID
            },{$set: {
              episodeNo: episodeNo,
              percentViewed: readPercent
            }},{upsert:true},function(err,user){
              if(err){console.log(err);}else{
                console.log('View record updated');
                loadUserViews(theUser._id);
              }
            });
          }
        }
      }
    });
  }

  Episode.findOne({
    bookID: bookID,
    episodeNo: episodeNo,
    isPublished: true
  },function(err,episode){
    if(err){console.log(err);}else{
      if(episode == null){
        res.redirect('/');
      }else{
        Episode.find({
          bookID: bookID,
          isPublished: true
        },function(err,episodes){
          if(err){console.log(err);}else{
            res.render('reader',{bookID:bookID,episode:episode,episodes:episodes});
          }
        });
      }
    }
  });

});

app.get('/editbook/:id',isLoggedIn,function(req,res){
  var bookID = req.params.id;
  Book.findOne({
    _id: bookID
  },function(err,book){
    if(err){console.log(err);}else{
      res.render('edit',{book:book});
    }
  });
});

app.post('/updateBook/:id',upload.single('bookCover'),function(req,res){
  //Get Book Info after Saving Book
  var imageName = req.file.filename;
  var title = req.body.title;
  var description = req.body.description;
  var bookID = req.params.id;
  var tags = req.body.tags.split('/');
  var tagsArr = [];
  tags.forEach(function(tag){
    tagsArr.push(tag);
  });
  var others = req.body.dropmat;
  var category = others.split('^')[0];
  var genre = others.split('^')[1];
  var language = others.split('^')[2];
  var copyright = others.split('^')[3];
  var mature = others.split('^')[4];
  var theCurUserID = others.split('^')[5];
  var fullUrl = req.protocol + '://' + req.get('host');
  var imageURL = fullUrl+'/uploads/bookImages/'+imageName;

  Book.update({
    _id: bookID
  }, {$set: {
    title: title,
    authorID: theCurUserID,
    rating: 0,
    genre: genre,
    imageURL: imageURL,
    description: description,
    category: category,
    uploadDate: new Date(),
    language: language,
    isOriginal: 0,
    isMature: mature,
    copyright: copyright,
    tags: tagsArr
  }}, {upsert:true}, function(err,book){
    if(err){
      console.log(err);
    }else{
      console.log('updated book: '+book);
      loadUserBooks(theUser);
      res.redirect('/');
    }
  });

});

app.post('/checkUserAvailable',function(req,res){

  console.log(req.body.regUser);

  User.find({
    userName: req.body.regUser
  },function(err, users){
    if(err){console.log(err);}else{
      if(users.length == 0){
        console.log('username available');
        res.end('0');
      }else{
        console.log('username taken');
        res.end('1');
      }
    }
  });

});

app.post('/checkEmailAvailable',function(req,res){

  console.log(req.body.regEmail);

  User.find({
    email: req.body.regEmail
  },function(err, users){
    if(err){console.log(err);}else{
      if(users.length == 0){
        console.log('email available');
        res.end('0');
      }else{
        console.log('email taken');
        res.end('1');
      }
    }
  });

});

app.post('/updateProfileAbout',isLoggedIn,function(req,res){

  var about = req.body.proDesc;
  var curUserID = req.body.curUserID;

  User.update({
    _id: curUserID
  },{$set: {
    about: about
  }},{upsert:true},function(err,user){
    if(err){console.log(err);}else{
      console.log('Profile description updated');
      res.end('1');
    }
  });

});

app.post('/updateProfileDOB',isLoggedIn,function(req,res){

  var dob = req.body.dob;
  var curUserID = req.body.curUserID;

  User.update({
    _id: curUserID
  },{$set: {
    dateOfBirth: dob
  }}, {upsert: true},function(err,user){
    if(err){console.log(err);}else{
      console.log('Profile DOB updated');
      res.end('1');
    }
  });

});

app.post('/updateProfileLoc',isLoggedIn,function(req,res){

  var location = req.body.loc;
  var curUserID = req.body.curUserID;

  User.update({
    _id: curUserID
  },{$set: {
    location: location
  }}, {upsert: true},function(err,user){
    if(err){console.log(err);}else{
      console.log('Profile Location updated');
      res.end('1');
    }
  });

});

app.post('/updateProfileGen',isLoggedIn,function(req,res){

  var gender = req.body.gen;
  var curUserID = req.body.curUserID;

  User.update({
    _id: curUserID
  },{$set: {
    gender: gender
  }}, {upsert: true},function(err,user){
    if(err){console.log(err);}else{
      console.log('Profile gender updated');
      res.end('1');
    }
  });

});

app.post('/updatePenName',isLoggedIn,function(req,res){

  var newName = req.body.penname;
  var curUserID = req.body.curUserID;

  User.update({
    _id: curUserID
  },{$set: {
    penName: newName
  }}, {upsert: true},function(err,user){
    if(err){console.log(err);}else{
      console.log('Profile pen name updated');
      res.end('1');
    }
  });

});

app.post('/updateProfileEmail',isLoggedIn,function(req,res){

  var email = req.body.email;
  var curUserID = req.body.curUserID;

  User.findOne({
    email: email
  },function(err,user){
    if(err){console.log(err);}else{
      if(user == null){
        User.update({
          _id: curUserID
        },{$set: {
          email: email
        }}, {upsert: true},function(err,user){
          if(err){console.log(err);}else{
            console.log('Profile email updated');
            res.end('1');
          }
        });
      }else if(user._id == curUserID){
        res.end('2');
      }else{
        res.end('3');
      }
    }
  })

});

app.get('/profile/:userName',function(req,res){
  User.findOne({
    userName: req.params.userName
  },function(err,user){
    if(err){console.log(err);}else{
      res.render('publicProfile',{pubUser:user});
    }
  });
});

app.post('/getModalAuthor',function(req,res){
  var bookID = req.body.bookID;
  var authorPen, authorUser, authorID;
  Book.findOne({
    _id: bookID
  },function(err,book){
    if(err){console.log(err);}else{
      authorID = book.authorID;
      User.findOne({
        _id: book.authorID
      },function(err,user){
        if(err){console.log(err);}else{
          authorPen = user.penName;
          authorUser = user.userName;
          res.end('Pen:'+authorPen+',User:'+authorUser);
        }
      });
    }
  });

});

app.post('/getEpisodes',function(req,res){
  var bookID = req.body.bookID;
  var episodeString = '';

  Episode.find({
    bookID: bookID
  }, function(err, episodes){
    if(err){console.log(err);}else{
      episodes.forEach(function(episode){
        if(episode.isPublished){
          episodeString += episode.title + '/' + episode.episodeNo + ';'
        }
      });
      res.end(episodeString);
    }
  });

});

app.post('/authorName',function(req,res){
  var authorID = req.body.authID;
  var bookID = req.body.bookID;

  User.findOne({
    _id: authorID
  },function(err,user){
    if(err){console.log(err);}else{
      res.end(user.penName+';'+bookID);
    }
  });

});

app.listen(port, function(){
  console.log('The server is running on http://127.0.0.1:'+port+'/ .');
});
