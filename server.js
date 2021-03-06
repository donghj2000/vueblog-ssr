const path = require('path');
const express = require('express');
const fs = require('fs');
const { renderToString } = require('@vue/server-renderer');
const proxy = require('express-http-proxy');
const cookieParser=require("cookie-parser");
const log4js = require("log4js");
const { dataCache } = require("./dataCache.js");
const apiRouter = require("./cacheRouter.js");


console.log(__dirname)
var parentPath = "";
if (__dirname.indexOf("dist") > 0) {
	parentPath = __dirname;
} else {
	parentPath = "./dist";
	parentPath = path.join(__dirname, parentPath);
}
console.log(parentPath)
const manifest = require(path.join( parentPath, "server/ssr-manifest.json"));

log4js.configure({
	appenders: {
		ruleConsole:{ type: 'console' },
	    ruleFile: { type: 'file', filename: 'cheese.log', category: 'cheese' }
	},
	categories: {
        default: {appenders: ['ruleConsole', 'ruleFile'], level: 'all'}
    }
});

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const resourceLoader = new jsdom.ResourceLoader({
	userAgent: "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36"
});
const dom = new JSDOM("", {
	url: "https://app.nihaoshijie.com.cn/index.html",
	resources: resourceLoader
});
//console.log("dom:", dom.window,dom.window.document,dom.window.document.cookie);
global.window = dom.window;
global.document = dom.window.document;
global.location = dom.window.location;
global.navigator = dom.window.navigator;
global.history = dom.window.history;
global.nodeis = true;


const appPath = path.join(parentPath, 'server', manifest['app.js'])
console.log(appPath);
const createApp = require(appPath).default
const server = express();
server.use(cookieParser());
server.use(log4js.connectLogger(log4js.getLogger("cheese"), {level: log4js.levels.ALL}));
server.use("/img",express.static(path.join( parentPath,"client", "img")));
server.use("/js", express.static(path.join( parentPath, "client", "js")));
server.use("/css",express.static(path.join( parentPath, "client", "css")));
server.use("/favicon.ico",express.static(path.join( parentPath, "client", "favicon.ico")));
server.use("/manifest.json",express.static(path.join( parentPath, "client", "manifest.json")));
server.use('/api', proxy('http://127.0.0.1:8000', {
	proxyReqPathResolver: function(req) {
        return `/api${req.url}`        
    },
})); //api???????????????django
server.use('/upload', proxy('http://127.0.0.1:8000', {
	proxyReqPathResolver: function(req) {
        return `/upload${req.url}`    
    },
})); //upload???????????????django

server.use("/apidata", apiRouter);

server.get("*", async (req, res) =>{
	console.log("url=",req.url);
	window.ssr_cookie = req.cookies;
	const { app, router, store } = createApp();
	const start = Date.now()

	try { // /admin->/login ??????????????????????????????
		await router.push(req.url);
	} catch (e) {
	 	console.log(e);
	}
	// ?????? router ????????????????????????????????????????????????
	router.isReady().then(() => {
		const matchedComps = router.currentRoute.value.matched.map(item=>item.components.default);
		// ???????????????????????????????????? `asyncData()`???????????????????????????store
		Promise.all(matchedComps.map(({ asyncData }) => asyncData && asyncData({
			store,
			route: router.currentRoute
		})))
		.then(async () => {
			// ????????? store ?????????????????????????????????????????????????????????
			const appContent = await renderToString(app);
			try {
				let html = fs.readFileSync(path.join(parentPath, "client/index.html"));
				// ????????????????????????????????????store?????????????????????????????????
				// ?????????:?????????window.INITIAL_STATE???
				// html = html.toString()
				// 	.replace('<div id="app">', `<div id="app">${appContent}`)
				// 	.replace(`''`, JSON.stringify(store.state));

				// ??????????????????LRU				
				let cachekey = "state-cache:" + req.hostname;   // ????????????????????????????????????MD?????????
				html = html.toString()
				.replace('<div id="app">', `<div id="app">${appContent}`)
				.replace(`{cachekey}`, cachekey);
				dataCache.set(cachekey, store.state);

				// ??????????????????redis ?????????????????????pm2??????node??????????????????
				// let cachekey = "state-cache:" + req.hostname;
				// html = html.toString()
				// .replace('<div id="app">', `<div id="app">${appContent}`)
				// .replace(`{cachekey}`, cachekey);
				// dataCache.set(cachekey, JSON.stringify(store.state));


				res.setHeader("Content-Type", "text/html");
				res.send(html);
				////////////////////////////debug/////////////////
				fs.writeFile(path.join(parentPath, "client/index_send.html"), html, function (error) {
					if (error) {
						console.log('????????????')
					} else {
						console.log('???????????????')
					}
				})
				///////////////////////////////////////////////////
			} catch (e) {
				console.log("e=============",e);
			}
		})
	})
});

console.log("listening 80...");
server.listen(80);

