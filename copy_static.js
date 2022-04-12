let copydir = require("copy-dir");
let fs = require("fs");

copydir.sync(process.cwd() + "/favicon.svg", process.cwd() + "/dist/client/img/icons//favicon.svg", {
	utimes: true, mode: true, cover: true
}, function(err) {
	if (err) { 
		console.log("err=",err);
		throw err;
	}
	console.log("copy /favicon.svg files done.");
});

copydir.sync(process.cwd() + "/package.json", process.cwd() + "/dist/package.json", {
	utimes: true,mode: true,cover: true
}, function(err) {
	if (err) { 
		console.log("err=",err);
		throw err;
	}
	console.log("copy /package.json files done.");
});

copydir.sync(process.cwd() + "/cacheRouter.js", process.cwd() + "/dist/cacheRouter.js", {
	utimes: true,mode: true,cover: true
}, function(err) {
	if (err) { 
		console.log("err=",err);
		throw err;
	}
	console.log("copy /cacheRouter.js files done.");
});

copydir.sync(process.cwd() + "/config.js", process.cwd() + "/dist/config.js", {
	utimes: true,mode: true,cover: true
}, function(err) {
	if (err) { 
		console.log("err=",err);
		throw err;
	}
	console.log("copy /config.js files done.");
});

copydir.sync(process.cwd() + "/dataCache.js", process.cwd() + "/dist/dataCache.js", {
	utimes: true,mode: true,cover: true
}, function(err) {
	if (err) { 
		console.log("err=",err);
		throw err;
	}
	console.log("copy /dataCache.js files done.");
});

copydir.sync(process.cwd() + "/pm2.conf.json", process.cwd() + "/dist/pm2.conf.json", {
	utimes: true,mode: true,cover: true
}, function(err) {
	if (err) { 
		console.log("err=",err);
		throw err;
	}
	console.log("copy /dataCpm2.conf.json files done.");
});

copydir.sync(process.cwd() + "/server.js", process.cwd() + "/dist/server.js", {
	utimes: true,mode: true,cover: true
}, function(err) {
	if (err) { 
		console.log("err=",err);
		throw err;
	}
	console.log("copy /server.js files done.");
});

copydir.sync(process.cwd() + "/nodemon.json", process.cwd() + "/dist/nodemon.json", {
	utimes: true,mode: true,cover: true
}, function(err) {
	if (err) { 
		console.log("err=",err);
		throw err;
	}
	console.log("copy /server.js files done.");
});

fs.mkdir(__dirname + "/dist/logs", { recursive: true }, (err) => {
	if (err) { 
		console.log("err=",err);
		throw err;
	}
	console.log("mkdir dir /dist/logs done");
});

console.log("copy files done.");