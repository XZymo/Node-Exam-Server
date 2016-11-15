/**http://127.0.0.1:3000/intro TO START**/

var http = require('http');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose(); //verbose provides more detailed stack trace
var url = require('url');

var db = new sqlite3.Database('data/db_exam');
var app = express(); //create express middleware dispatcher
var urlObj; //we will parse user GET URL's into this object

//CHANGEABLE VALUES//
var examTimeMinutes = 3;
var totalAttempts = 4;
var port = 3000;
var hostNport = 'http://127.0.0.1:'+port;

var attempts = totalAttempts;
var credentials = [];


function shuffle(array) {
    for (var i = array.length - 1; i >= 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
//add a user table to database
//serialize ensures the queries are presented to database serially.
db.serialize(function(){
/*****************************LOGIN****************************************/
	var sqlString = "CREATE TABLE IF NOT EXISTS users (userid TEXT PRIMARY KEY, password TEXT, result REAL, attempts INTEGRER)";
	db.run(sqlString);
	sqlString = "INSERT OR REPLACE INTO users VALUES ('studentA', '2406', '0.0', "+ totalAttempts +")";
	db.run(sqlString);
	sqlString = "INSERT OR REPLACE INTO users VALUES ('studentB', '2406A', '0.0', "+ totalAttempts +")";
	db.run(sqlString);
/*******************************QUESTIONS****************************************/
	sqlString = "CREATE TABLE IF NOT EXISTS questions (Q INTEGRER PRIMARY KEY, question TEXT, a1 TEXT, a2 TEXT, a3 TEXT, a4 TEXT, a5 TEXT, answer TEXT)";
	db.run(sqlString);
	sqlString = "INSERT OR REPLACE INTO questions VALUES (1, 'Which ONE of the following is officially of type object in JavaScript?', 'Boolean', 'Undefined', 'String', 'Number', 'Array', 'a5')";
	db.run(sqlString);
	sqlString = "INSERT OR REPLACE INTO questions VALUES (2, 'Which ONE of the following is FALSE about URLs, IP addresses and Ports?', 'Accessing http://localhost:3000 uses the TCP/IP stack', 'An IP address can serve more than one port number at a time', 'The URL http://localhost:3000/login.html refers specifically to a sever file named \"login.html\"', 'An IP address represents a computer host on the internet', 'A port number need not always be supplied in a URL', 'a3')";
	db.run(sqlString);
	sqlString = "INSERT OR REPLACE INTO questions VALUES (3, 'Which ONE of the following best explains what the f.prototype property of a function object f refers to in JavaScript?', 'It is the inheritance prototype of an object created as new f()', 'It is the inheritance prototype of object f', 'It is not defined when f is used as a constructor with new', 'It is undefined because .prototype only applies to non-function objects', 'Only applies to modules and primitive objects', 'a1')";
	db.run(sqlString);
	sqlString = "INSERT OR REPLACE INTO questions VALUES (4, 'Which ONE of the following is FALSE about JSON encoding?', 'Not all JavaScript objects can be converted to JSON', 'JSON can describe data but not JavaScript functions', 'JSON can use string literals to represent values', 'JSON strings can use single or double quotes to describe property names', 'JSON representations are not JavaScript objects', 'a4')";
	db.run(sqlString);
	sqlString = "INSERT OR REPLACE INTO questions VALUES (5, 'Which ONE of the following statements about strings in JavaScript is FALSE', 'Strings are considered primitives in JavaScript documentation', 'It is safe to use a for(ch in myString) to loop over characters of strings', 'Character strings in JavaSript can be tested for equality with the == operator', 'Strings can be represented literally with either single or double quotes in JavaScript', 'Strings are actually objects because they can have object properties assigned to them', 'a2')";
	db.run(sqlString);
});

function authenticate(request, response, next){
    /*
	Middleware to do BASIC http 401 authentication
	*/
    var auth = request.headers.authorization;
	// auth is a base64 representation of (username:password) 
	//so we will need to decode the base64 
	if(!auth){
 	 	//note here the setHeader must be before the writeHead
		response.setHeader('WWW-Authenticate', 'Basic realm="need to login"');
        response.writeHead(401, {'Content-Type': 'text/html'});
		response.write('<h1> UNAUTHORIZED ACCESS DENIED 401 </h1>');
		response.write('<p><a href="'+ hostNport +'/intro">Return to login page</a></p>');
		console.log('No authorization found, send 401.');
 		response.end();  
	} else {
	    console.log("Authorization Header: " + auth);
        //decode authorization header
		// Split on a space, the original auth 
		//looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part 
        var tmp = auth.split(' ');   		
		
		// create a buffer and tell it the data coming in is base64 
        var buf = new Buffer(tmp[1], 'base64'); 
 
        // read it back out as a string 
        //should look like 'ldnel:secret'		
		var plain_auth = buf.toString();
        console.log("Decoded Authorization ", plain_auth);
		
        //extract the userid and password as separate strings
        credentials = plain_auth.split(':');      // split on a ':'
        var username = credentials[0];
        var password = credentials[1];
        console.log("User: ", username);
        console.log("Password: ", password);
		
		var authorized = false;
		//check database users table for user
		db.all("SELECT userid,password,attempts FROM users", function(err, rows){
			for(var i=0; i<rows.length; i++){
				  if(rows[i].userid == username & rows[i].password == password && rows[i].attempts >= 0) authorized = true;		     
			}
			if(authorized == false){
			   //we had an authorization header by the user:password is not valid
			   response.setHeader('WWW-Authenticate', 'Basic realm="need to login"'); 
			   response.writeHead(401, {'Content-Type': 'text/html'});
			   response.write('<meta http-equiv="refresh" content="0; url='+ hostNport +'/intro" />');
			   console.log('No authorization found, send 401.'); 
			   response.end();
			} else {
				next();
			}
		});
	}
}
function parseURL(request, response, next){
	var parseQuery = true; //parseQueryStringIfTrue 
    var slashHost = true; //slashDenoteHostIfTrue 
    urlObj = url.parse(request.url, parseQuery , slashHost );
	next();
}
function respondToClient(request, response, next){
    response.end();
	//notice no call to next()
  
}
function addHeader(request, response, next){
        var title = 'COMP 2406a4: Exam Server';
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write('<!DOCTYPE html>');
        response.write('<html><head><title>Exam Server</title></head><body>');
        response.write('<h1>' +  title + '</h1>');
		response.write('<hr>');
		next();
}
function addFooter(request, response, next){
 		response.write('<hr>');
		response.write('<h3>' +  'Carleton University' + '</h3>');
		response.write('<h3>' +  'School of Computer Science' + '</h3>');
        response.write('</body></html>');
		next();

}
//INTRO-PAGE
function intro(request, response, next){
	db.all("SELECT userid,password,attempts FROM users", function(err, rows){
		for (var i=0; i<rows.length; i++){
			if (rows[i].userid == credentials[0]){
				response.write('<h2> Midterm Server </h2>');
				response.write('<p>Welcome to the virtual exam server <strong>'+ credentials[0] +'</strong>!</p>');
				response.write('<p>Please refrain from putting this browser page in your background and keep this window in full-screen mode. You will have <strong>'+ examTimeMinutes +'mins</strong> to complete this exam, starting when the link below is clicked. *MAKE SURE TO REVIEW BEFORE SUBMISSION AS ONLY <strong>'+ totalAttempts +'</strong> ATTEMPTS WILL BE ACCEPTED! GOOD LUCK!</p>');
				response.write('<p><strong>ATTEMPT: '+ rows[i].attempts +'/'+ totalAttempts +' </strong></p>');
				response.write('<p><a href="'+ hostNport +'/full"> CLICK HERE TO START EXAM </a></p>');
			}
		}
		next();
	});
}
//FULL-PAGE
function fullExam(request, response, next){
	db.all("SELECT userid,password,attempts FROM users", function (err, rows){
		for(var i=0; i<rows.length; i++){
			if (rows[i].userid == credentials[0] && rows[i].attempts == 0){
				response.write('<meta http-equiv="refresh" content="0; url='+ hostNport +'/results" />');
			}
		}
	});
	response.write('<h2> Midterm </h2><meta http-equiv="refresh" content="'+(examTimeMinutes*60)+'; url='+ hostNport +'/results" />');
	var sql = "SELECT Q,question,a1,a2,a3,a4,a5,answer FROM questions";
	response.write('<ul><form >');
	db.all(sql, function(err, rows){
		shuffle(rows);
		for(var i=0; i< rows.length; i++){
			response.write('<p><strong>'+ (i + 1) +'. '+ rows[i].question +'</strong></p>');
			response.write('<input type="radio" name="'+ rows[i].Q +'" value="a1" checked>'+ rows[i].a1 + '<br/>');
			response.write('<input type="radio" name="'+ rows[i].Q +'" value="a2">'+ rows[i].a2 + '<br/>');
			response.write('<input type="radio" name="'+ rows[i].Q +'" value="a3">'+ rows[i].a3 + '<br/>');
			response.write('<input type="radio" name="'+ rows[i].Q +'" value="a4">'+ rows[i].a4 + '<br/>');
			response.write('<input type="radio" name="'+ rows[i].Q +'" value="a5">'+ rows[i].a5 + '<br/>');
		}
		response.write('<input type="submit" value="Submit">');
		response.write('</form></ul>');
		next();
	});
	// if submit
	if (urlObj.query['1'] && urlObj.query['2'] && urlObj.query['3'] && urlObj.query['4'] && urlObj.query['5']){
		var score = 0;
		var parseQuery = true;
		var slashHost = true;
		urlObj = url.parse(request.url, parseQuery , slashHost );
	//Calculate score
		db.all(sql, function (err, rows){
			var qcount = rows.length;
			score = qcount;
			for(var i=0; i<rows.length; i++){
				for(x in urlObj.query){
					if (rows[i].Q == x && rows[i].answer != urlObj.query[x]){
						score--;
					}
				}
			}
	//Update mark
			var result = (score*100)/qcount;
			db.run("UPDATE users SET result = ? WHERE userid = ?", result, credentials[0]);
			db.run("UPDATE users SET attempts = attempts-1 WHERE userid = ?", credentials[0]);
		});
		response.write('<meta http-equiv="refresh" content="0; url='+ hostNport +'/results" />');
	}
}
//RESULTS-PAGE
function results(request, response, next){
	response.write('<h2> RESULTS </h2>');
	db.all("SELECT userid,password,result,attempts FROM users", function (err, rows){
		var count = rows.length;
		var total = 0;
		for(var i=0; i<rows.length; i++){
			total += rows[i].result;
			if (rows[i].userid == credentials[0]){
				response.write('<p> Student: '+ credentials[0] +'</p>');
				response.write('<p>Mark: <strong>'+ rows[i].result +'%</strong></p>');
				response.write('<p>Attempts left: <strong>'+ rows[i].attempts +'/'+ totalAttempts +'</strong></p>');
				response.write('<p><a href="'+ hostNport +'/intro"> CLICK HERE TO RETURN TO INTRO </a></p>');
			}
		}
		response.write('<p> Class Average = '+  (total/count) +'% </p>');
		next();
	});
}

//MIDDLEWARE
app.use(bodyParser.urlencoded());
app.use(logger('dev'));
app.use(parseURL);
app.use(authenticate);
app.use(addHeader);
app.use('/intro', intro);
app.use('/full', fullExam);
app.use('/results', results);
app.use(addFooter);
app.use(respondToClient);

//create http-express server
http.createServer(app).listen(port);

console.log('Server Running at '+ hostNport +'  CNTL-C to quit');