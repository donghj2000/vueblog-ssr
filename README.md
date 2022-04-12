# vueblog-ssr
vueblog的ssr版本，按照vue官方步骤搭建，仅提供文章列表和文章详细两个页面的服务端渲染。
launch.json,vuessr.code-workspace这两个文件是vscode调试node的文件，需建立.vscode文件夹(注意.号)，将这2个文件放入其中。

### 安装依赖
```
npm install或
cnpm install
```

### 开发调试
```
npm run serve
```

### 生产打包
```
npm run build
```

### 使用 nodemon 调试服务端程序
```
npm install nodemon -g
nodemon server.js
```

### 使用 pm2 部署
```
npm install pm2 -g
pm2 start pm2.conf.json
```
