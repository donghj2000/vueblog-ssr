import createApp from "./main";
import { createWebHistory,useRoute } from "vue-router";

import axios from "axios";

const { app, router, store } = createApp(createWebHistory(process.env.BASE_URL));

//将服务端渲染的vuex数据，替换到客户端的vuex中
// if (window.__INITIAL_STATE__) {
//       store.replaceState(window.__INITIAL_STATE__)
// }

async function getStoreData() {
    let key = window.cachekey;
    console.log("key=",key);
    try {
        const data = await axios.get(`/apidata/router-cache/${key}`);
        console.log(data);
        store.replaceState(data.data);
    } catch (e) {
        console.log(e);
    }
}

router.isReady().then(()=>{
    getStoreData();
    if (/\/admin/i.test(router.currentRoute.value.path)
        && (!store.state.user.id ||
        !store.state.user.is_superuser)) {
            router.push('/login');
    }

    router.beforeEach((to, from, next) => {
        //console.log("from=",from);
        //console.log("to  =",to);
        if (/\/admin/i.test(to.path)
            && (!store.state.user.id ||
            !store.state.user.is_superuser)) {
            next('/login');
            return;
        }
        const matched = to.matched.map(item=>item.components.default);
        const prevMatched = from.matched.map(item=>item.components.default);

        let diffed = false
        const activated = matched.filter((c, i) => {
            return diffed || (diffed = (prevMatched[i] !== c))
        });

        Promise.all(activated.map(c => {
            if (c.asyncData) {
                return c.asyncData({ store, route: to })
            }
        })).then(() => {
            next();
        }).catch(e=>{
            console.log("router.beforeEach,e=",e);
            next();
        })
    })
    app.mount('#app');    
})
