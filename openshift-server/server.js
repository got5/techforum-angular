#!/bin/env node
//  OpenShift sample Node application
var express 	= require('express');
var fs      	= require('fs');
var Db 			= require('mongodb').Db;
var Connection 	= require('mongodb').Connection;
var Server 		= require('mongodb').Server;
var BSON 		= require('mongodb').BSON;
var ObjectID 	= require('mongodb').ObjectID;
var ConferenceProvider 	= require('./providers/ConferenceProvider').ConferenceProvider;
var MessageProvider 	= require('./providers/MessageProvider').MessageProvider;
/**
 *  Define the sample application.
 */
var TechForumApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_INTERNAL_IP;
        self.port      = process.env.OPENSHIFT_INTERNAL_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_INTERNAL_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };

    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };

    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
			console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
			process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };

    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };

    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };
 
        self.routes['/conferences'] = function(req, res) {
			self.conferenceProvider.findAll(function(error, items) {
				res.send(items);
			});
		};
		self.routes['/conferences/:id'] = function(req, res) {
			var id = req.params.id;
			self.conferenceProvider.findById(id, function(error, item) {
				res.send(item);
			});
		};
		self.routes['/messages/:type'] = function(req, res) {
			var type = req.params.type;
			if(["feelbacks","comments"].indexOf(type) != -1) {
				// real type is stored without the 's'
				type = type.slice(0,type.length-1);
				
				self.messageProvider.findAll(type,function(error, items) {
					res.send(items);
				});
			} else {
				res.send('<pre style="word-wrap: break-word; white-space: pre-wrap;">Cannot GET /messages/'+type+' : Unknown message type "'+type+'"</pre>');
			}
		};
		self.routes['/messages/comments/:id'] = function(req, res) {
			var id = req.params.id;
			self.messageProvider.findAllComments(id,function(error,items) {
				res.send(items);
			});
		};
        
		self.routes['/'] = function(req, res) {
            var str = "";
            for(var i in self.routes) str += "<a href='./"+i+"'>"+i+"</a><br />";
            res.setHeader('Content-Type', 'text/html');
            res.send("<html><body><p>ROUTES AVAILABLES</p>"+str+"</body></html>");
            //res.send(self.cache_get('index.html') );
        };
    };
	
	self.createForms = function() {
		self.forms = { };
		
		self.forms['/messages/:type'] = function(req, res) {
			var type = req.params.type;
			if(["feelbacks","comments"].indexOf(type) != -1) {
				self.messageProvider.save(req.body, function(error, result) {
					res.send(result);
				});
			} else {
				res.send('<pre style="word-wrap: break-word; white-space: pre-wrap;">Cannot POST /messages/'+type+' : Unknown message type "'+type+'"</pre>');
			}
		};
	};

	self.setupDatabase = function(callback) {
		var dbname 	= process.env.OPENSHIFT_APP_NAME;
		var host 	= process.env.OPENSHIFT_MONGODB_DB_HOST;
		var port 	= parseInt(process.env.OPENSHIFT_MONGODB_DB_PORT);
		var user 	= process.env.OPENSHIFT_MONGODB_DB_USERNAME;
		var passwd	= process.env.OPENSHIFT_MONGODB_DB_PASSWORD;
		
		var srv = new Server(host, port, {auto_reconnect: true, poolSize: 5}, {});
		self.db = new Db(dbname, srv, {logger: {
			error:function(message, object) { console.log("#error %s", message); }, 
			log:function(message, object) { console.log("#log %s", message); }, 
			debug:function(message, object) {console.log("#debug %s", message); }
			}
		});
		
		function routine(attempt) {
			self.db.open(function(err, db) {
				console.log("Attempt #%d to connect to %s",attempt, process.env.OPENSHIFT_MONGODB_DB_URL);
				if(err) {
					if(attempt < 10) setTimeout( function() { self.db.close(); routine(++attempt) }, 1000);
					else {
						console.log("Maximum attempts exceeded. Database is unavailable.");
						self.terminator("NODB");
					}
				} else {
					db.authenticate(user,passwd, function(error, result) {
						if(error) console.log("Error when authenticating database user: %s", error);
						else {
							console.log("Database connection to techforumdb opened !");
							callback();
						}
					});
				}
			});
		}
		
		routine(1);
	}
	
	self.setupProviders = function() {
		if(self.db) {
			self.conferenceProvider = new ConferenceProvider(self.db);
			self.messageProvider = new MessageProvider(self.db);
		} else {
			console.log("Error: Can not define providers");
		}
	}

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
		self.createForms();
		
        self.app = express.createServer();
		//self.app.use(express.logger('dev'));
		self.app.use(express.bodyParser());
		
		// CORS Support
		self.app.all('*', function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
			if ('OPTIONS' == req.method) return res.send(200);
			next();
		});

        //  Add handlers for the app (from both routes and forms)
        for (var r in self.routes) self.app.get(r, self.routes[r]);
		for (var f in self.forms) self.app.post(f, self.forms[f]);
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

		// Connection to mondodb database
		self.setupDatabase(function() { self.setupProviders(); });
        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d...',
                        Date(Date.now()), self.ipaddress, self.port);
        });
    };

};   /*  TechForum Application.  */



/**
 *  main():  Main code.
 */
var zapp = new TechForumApp();
zapp.initialize();
zapp.start();

