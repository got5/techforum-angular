var Db 			= require('mongodb').Db;
var BSON 		= require('mongodb').BSONPure;

MessageProvider = function(database) {
	this.db = database;
	this.collectionName = "messages";
};


MessageProvider.prototype.getCollection = function(callback) {
	this.db.collection(this.collectionName, function(error, message_collection) {
		if(error) callback(error);
		else callback(null, message_collection);
	});
};

MessageProvider.prototype.findAll = function(type,callback) {
    this.getCollection(function(error, message_collection) {
		if(error) callback(error)
		else {
			message_collection.find({'type':type},{'name':1,'msg':1,'date':1})
				.toArray(function(error, results) {
				if(error) callback(error)
				else callback(null, results)
			});
		}
    });
};

MessageProvider.prototype.findAllComments = function(id, callback) {
    this.getCollection(function(error, message_collection) {
		if(error) callback(error)
		else {
			message_collection.find({'type':'comment','idConference':id},{'name':1,'msg':1,'date':1})
				.toArray(function(error, results) {
				if(error) callback(error)
				else callback(null, results)
			});
		}
    });
}

MessageProvider.prototype.save = function(message, callback) {
    this.getCollection(function(error, message_collection) {
		if(error) callback(error)
		else {
			message_collection.insert(message, {safe:true}, function(error, results) {
				if(error) callback(error)
				else callback(null,results[0])
			});
		}
    });
};

exports.MessageProvider = MessageProvider;