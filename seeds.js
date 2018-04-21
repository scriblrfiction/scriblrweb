var mongoose = require('mongoose'),
    Book     = require('./models/book'),
    Rating   = require('./models/rating'),
    Episode  = require('./models/episode'),
    Category = require('./models/category'),
    Genre = require('./models/genre'),
    User  = require('./models/user');

var dataBooks = [
  {
    title: 'Swing Time',
    authorID: '5a9395df4c12d544d420e99c',
    rating: 0,
    genre: 'General',
    imageURL: 'https://images-na.ssl-images-amazon.com/images/I/51hi92m66BL.jpg',
    description: 'Swing Time is a novel by British writer Zadie Smith. Smith began to read excerpts from her novel in autumn 2015 with an intended release date of autumn 2016. The release date was later confirmed as 15 November 2016.',
    category: 'Short Story',
    uploadDate: '15/09/16',
    language: 'English',
    isOriginal: true,
    isMature: false,
    copyright: true,
    tags: ['Swing Time','Zadie Smith']
  },{
    title: 'DOJO Pizza',
    authorID: '5a9395df4c12d544d420e99c',
    rating: 0,
    genre: 'Fantasy',
    imageURL: 'https://about.canva.com/wp-content/uploads/sites/3/2015/01/creative_bookcover.png',
    description: 'This is kewl AF diskripshun',
    category: 'Shortest Story',
    uploadDate: '21/05/17',
    language: 'Alien',
    isOriginal: true,
    isMature: true,
    copyright: true,
    tags: ['Swing Time','Zadie Smith']
  }
];

var dataCategory = [
  {
    category: 'Poetry',
    isDisabled : false
  },
  {
    category: 'Microfiction',
    isDisabled : false
  },
  {
    category: 'Comics',
    isDisabled : false
  },
  {
    category: 'Contests',
    isDisabled : false
  }
];

var dataGenre = [
  {
    genre: 'Romance',
    isDisabled : false
  },
  {
    genre: 'Horror',
    isDisabled : false
  },
  {
    genre: 'Mystery',
    isDisabled : false
  },
  {
    genre: 'Teen',
    isDisabled : false
  },
  {
    genre: 'Fantasy',
    isDisabled : false
  },
  {
    genre: 'Sci-Fi',
    isDisabled : false
  },
  {
    genre: 'General',
    isDisabled : false
  }
]

function seedDB(){
  Book.remove({}, function(err){
    if(err){console.log(err);}else{
      console.log('Removed Books');
      dataBooks.forEach(function(bookItem){
        Book.create(bookItem, function(err, book){
          if(err){console.log(err);}else{
            console.log('Added a book');
          }
        });
      });
    }
  });
  Rating.remove({}, function(err){
    if(err){console.log(err);}else{
      console.log('Removed Ratings');
    }
  });
  Category.remove({},function(err){
    if(err){console.log(err);}else{
      console.log('Removed Categories');
      dataCategory.forEach(function(category){
        Category.create(category,function(err,category){
          if(err){console.log(err);}else{
            console.log('Added Category');
          }
        });
      });
    }
  });
  Genre.remove({},function(err){
    if(err){console.log(err);}else{
      console.log('Removed Genres');
      dataGenre.forEach(function(genre){
        Genre.create(genre,function(err,genre){
          if(err){console.log(err);}else{
            console.log('Added Genre');
          }
        });
      });
    }
  });
}

module.exports = seedDB;
