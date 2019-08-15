let express = require('express');
let colors = require('colors');
let http = require('http');
let _ = require('lodash');
let socketio = require('socket.io');
let bodyParser = require('body-parser');

const mongoose = require('mongoose');
const mongoURL = 'mongodb://localhost:27017/slack';

let session = require('./routes/session');
let company = require('./routes/company');
let ticket = require('./routes/ticket');
let comment = require('./routes/comment');
let user = require('./routes/user');
let thread = require('./routes/thread');
let identifier = require('./routes/identifier');

let app = express();
let connected_users = [];

app.use('/static', express.static(__dirname + '/public'));
app.use('/files', express.static(__dirname + '/public/files'));
app.use(
	bodyParser.urlencoded({
		extended: false
	})
);
app.use(bodyParser.json());

app.use((req, res, next) => {
	req.io = io;
	next();
});

// Add headers
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
	res.setHeader('Access-Control-Allow-Headers', '*');
	next();
});

app.use('/api', session);
app.use('/api', company);
app.use('/api', ticket);
app.use('/api', comment);
app.use('/api', user);
app.use('/api', thread);
app.use('/api', identifier);

mongoose.connect(mongoURL, { useNewUrlParser: true }).then(
	() => {
		console.log(`Connected to Mongo server`);
	},
	(error) => {
		console.log(error);
	}
);

let server = app.listen(80, () => {
	console.log(`Server running`);
	console.log(`mongod --fork --logpath /var/log/mongod.log`.blue);
	console.log(`firewall-cmd --add-port=80/tcp`.blue);
});

var io = socketio.listen(server);

io.on('connection', (socket) => {
	console.log('CONNECTION'.bgGreen.white + ' ' + colors.green(socket.request._query.username));

	if (!_.includes(connected_users, socket.request._query.user_id)) {
		connected_users.push(socket.request._query.user_id);
	}

	io.sockets.emit('connected_users', connected_users);

	socket.on('ticket.create', (data) => {
		console.log('ticket.create', data);
	});

	socket.on('from_python', (data) => {
		console.log('from_python', data);
	});

	socket.on('disconnect', () => {
		console.log('DISCONNECTION'.bgRed.white + ' ' + colors.red(socket.request._query.username));
		if (_.includes(connected_users, socket.request._query.user_id)) {
			_.pull(connected_users, socket.request._query.user_id);
		}
		io.sockets.emit('connected_users', connected_users);
	});
});
