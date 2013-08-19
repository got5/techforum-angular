var Db 			= require('mongodb').Db;
var BSON 		= require('mongodb').BSONPure;

ConferenceProvider = function(database) {
	this.db = database;
	this.collectionName = "conferences";
};


ConferenceProvider.prototype.getCollection = function(callback) {
	this.db.collection(this.collectionName, function(error, conference_collection) {
		if(error) callback(error);
		else callback(null, conference_collection);
	});
};

ConferenceProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, conference_collection) {
		if(error) callback(error)
		else {
			conference_collection.find({},{title:1,when:1,author:1,where:1,day:1,theme:1})
				.toArray(function(error, results) {
				if(error) callback(error)
				else callback(null, results)
			});
		}
    });
};


ConferenceProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, conference_collection) {
		if(error) callback(error)
		else {
			conference_collection.findOne({_id: new BSON.ObjectID(id)}, function(error, result) {
				if(error) callback(error)
				else callback(null, result)
			});
		}
    });
};

ConferenceProvider.prototype.save = function(articles, callback) {
    this.getCollection(function(error, article_collection) {
      if(error) callback(error)
      else {
        if( typeof(articles.length)=="undefined")
          articles = [articles];

        for( var i =0;i< articles.length;i++ ) {
          article = articles[i];
          article.created_at = new Date();
          if( article.comments === undefined ) article.comments = [];
          for(var j =0;j< article.comments.length; j++) {
            article.comments[j].created_at = new Date();
          }
        }

        article_collection.insert(articles, function() {
          callback(null, articles);
        });
      }
    });
};

exports.ConferenceProvider = ConferenceProvider;