import {InjectionKey} from 'vue';
import {createStore, Store} from 'vuex';
import axios from "axios";
import {Nav, User, ArticleParams, Article} from "../types";
import { getCookie } from "./../utils/index";

export interface State {
    user: User,
    articleParams:ArticleParams,
    navIndex: string,
    navs: Array<Nav>,
    articleList:  Array<Article>,
    articleCount: number,
    article: Article
}

export const StateKey: InjectionKey<Store<State>> = Symbol();
export const SET_USER = 'setUser';
export const CLEAR_USER = 'clearUser';
export const SET_NAV_INDEX = 'setNavIndex';
export const SET_ARTICLE_PARAMS = 'setArticleParams';
export const SET_NAV_INDEX_BY_ROUTE = 'setNavIndexByRoute';

const APIHOST = "http://127.0.0.1:8000";


export const initDefaultUserInfo = (): User=>{
    let user: User = {
        id: 0,
        username: "",
        nickname: "",
        created_at: "",
        last_login: "",
        avatar: "",
        email: "",
        is_active: false,
        is_superuser: false,
        desc: ""
    };

    let userInfo = "";
    if (window.ssr_cookie) {
        userInfo = window.ssr_cookie.userInfo;
    } else {
        userInfo = getCookie("userInfo");
    }

    if (userInfo) {
        user = JSON.parse(userInfo);
    }
    return user;
}
export const initDefaultArticleParams = (): ArticleParams => {
    let params: ArticleParams = {
        text: undefined,
        search: undefined,
        status: 'Published',
        tags: undefined,
        catalog: undefined,
        page: 1,
        page_size: 10,
    }
    return params
}

export function createSSRStore () {
    return createStore<State>({
        state() {
            return {
                user: initDefaultUserInfo(),
                articleParams: initDefaultArticleParams(),
                navIndex: '1',
                navs: [
                    {
                        index: '1',
                        path: '/',
                        name: '??????',
                    },
                    {
                        index: '2',
                        path: '/catalog',
                        name: '??????',
                    },
                    {
                        index: '3',
                        path: '/archive',
                        name: '??????',
                    },
                    {
                        index: '4',
                        path: '/message',
                        name: '??????',
                    },
                    {
                        index: '5',
                        path: '/about',
                        name: '??????',
                    },
                ],
                // ????????????????????????????????? 
                articleList: [] as Array<Article>,
                articleCount: 0,
                article: {} as Article
            }
        },
        mutations: {
            setUser(state: object|any, userInfo: object|any) {
                for (const prop in userInfo){
                    state[prop] = userInfo[prop];
                }
            },
            clearUser(state: object|any) {
                state.user = initDefaultUserInfo();
            },
            setNavIndex(state: object|any, navIndex: string) {
                state.navIndex = navIndex;
            },
            setArticleParams(state: object | any, params: object) {
                state.articleParams = {...state.articleParams, ...params};
            },


            setArticleList(state: object|any, articleListObj: object|any) {
                state.articleList = articleListObj.results;
                state.articleCount = articleListObj.count;
            },
            setArticle(state: object|any, article: Article) {
                state.article = article;
            }
        },
        actions: { //action???????????????????????????????????????store, ?????????????????????????????????
            setNavIndexByRoute(store: object|any, route: string) {
                const index = store.state.navs.findIndex((r: any) => r.path === route)
                if (store.state.navIndex === store.state.navs[index].index)
                    return
                if (index > -1) {
                    //commit(SET_NAV_INDEX, state.navs[index].index)
                    store.state.navIndex = store.state.navs[index].index;
                }
            },

            //??????2?????????????????????????????????
            async getArticleDetail(store: object|any, id: number) {
                try {
                    const data: any = await axios.get(`${APIHOST}/api/article/${id}/`);
                    store.commit('setArticle', data.data);
                    console.log("setArticle: ", data.data);
                } catch (e) {
                    console.log(e);
                }    
            },
            async getArticleList(store: object|any) {
                const params: any = {
                    status: "Published",
                    page: 1,
                    page_size:10,
                };
                try {
                    const data: any = await axios.get(`${APIHOST}/api/article`,{ params });
                    store.commit('setArticleList', data.data);
                } catch (e) {
                    console.log(e);
                }     
                // ?????????????????????promise.?????????????????????????????? async          
                // return axios.get(`${APIHOST}/api/article`,{
                //     params
                // })
                // .then((res:any) => {
                //     console.log("res:", res.data);
                //     store.commit('setArticleList', res.data);
                // })
                // .catch((err: any)=>{
                //     console.log(err);
                // });
            }
        }
    })
}
