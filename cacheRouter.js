const express = require("express");
const router = express.Router();
const { dataCache } = require("./dataCache.js");

router.get("/router-cache/:key",(req,res)=>{
    let key = req.params.key;
    // 一，LRU
    // let state = dataCache.peek(key);
    // res.setHeader("Content-Type", "application/json");
    // res.send(state);
    // 二，Redis
    dataCache.get(key, (err, data)=>{
        let state = JSON.parse(data);
        res.setHeader("Content-Type", "application/json");
        res.send(state);
    });
});

module.exports = router;