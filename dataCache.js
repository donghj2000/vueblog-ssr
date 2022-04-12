// 一，LRU缓存
const LRU = require("lru-cache");
const dataCache = new LRU({
    max: 1000,
    magAge: 1000 * 60 * 15
});

//二，redis缓存
// var redis = require('redis'),
//     config = require('./config'),
//     dbConfig = config.redis,
//     RDS_PORT = dbConfig.port,     //端口号
//     RDS_HOST = dbConfig.host;     //服务器IP
	
// var dataCache = redis.createClient(RDS_PORT, RDS_HOST);
// dataCache.on('ready',function(res){
//     console.log('ready');
// });
// dataCache.on('end',function(err){
//     console.log('end');
// });
// dataCache.on('error', function (err) {
//     console.log(err);
// });
// dataCache.on('connect',function(){
//     console.log('redis connect success!');
// });
// dataCache.set('name', 'zyc', function (err, res) {
//     // todo..
// });
// dataCache.get('name', function (err, res) {
//     // todo...           
// });

module.exports = {
	dataCache
}
