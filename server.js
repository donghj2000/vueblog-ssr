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
})); //api接口转发到django
server.use('/upload', proxy('http://127.0.0.1:8000', {
	proxyReqPathResolver: function(req) {
        return `/upload${req.url}`    
    },
})); //upload接口转发到django

server.use("/apidata", apiRouter);

server.get("*", async (req, res) =>{
	console.log("url=",req.url);
	window.ssr_cookie = req.cookies;
	const { app, router, store } = createApp();
	const start = Date.now()

	try { // /admin->/login 前端跳转，后端不需要
		await router.push(req.url);
	} catch (e) {
	 	console.log(e);
	}
	// 等到 router 将可能的异步组件和钩子函数解析完
	router.isReady().then(() => {
		const matchedComps = router.currentRoute.value.matched.map(item=>item.components.default);
		// 对所有匹配的路由组件调用 `asyncData()`，将获取的数据存入store
		Promise.all(matchedComps.map(({ asyncData }) => asyncData && asyncData({
			store,
			route: router.currentRoute
		})))
		.then(async () => {
			// 我们的 store 现在已经填充入渲染应用程序所需的状态。
			const appContent = await renderToString(app);
			try {
				let html = fs.readFileSync(path.join(parentPath, "client/index.html"));
				// 后端请求的数据已经放入到store中，有多种方法传回前端
				// 方法一:注入到window.INITIAL_STATE中
				// html = html.toString()
				// 	.replace('<div id="app">', `<div id="app">${appContent}`)
				// 	.replace(`''`, JSON.stringify(store.state));

				// 方法二：存入LRU				
				let cachekey = "state-cache:" + req.hostname;   // 可以使用更复杂的字段，做MD加密等
				html = html.toString()
				.replace('<div id="app">', `<div id="app">${appContent}`)
				.replace(`{cachekey}`, cachekey);
				dataCache.set(cachekey, store.state);

				// 方法三：存入redis 。。。，在使用pm2开启node多进程时有用
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
						console.log('写入失败')
					} else {
						console.log('写入成功了')
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

