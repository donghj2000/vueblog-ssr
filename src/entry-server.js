import createApp from "./main";
import { createMemoryHistory } from 'vue-router';

export default function() {
	const { app, router, store } = createApp(createMemoryHistory())
	return { 
		app,
		router,
		store
	}
}