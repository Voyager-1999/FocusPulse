import {createRouter,createWebHashHistory} from 'vue-router'

import ToDo from '../views/ToDo.vue'
import TomatoClock from '../views/TomatoClock.vue'
import ClassSchedule from '../views/ClassSchedule.vue'

const router = createRouter({
	history:createWebHashHistory(),
	routes:[
		{
			path:'/',
			redirect:'/ToDo'	
		},
		{
			path:'/ToDo',
			component:ToDo
		},
		{
			path:'/TomatoClock',
			component:TomatoClock
		},
		{
			path:'/ClassSchedule',
			component:ClassSchedule
		}
	]
})

export default router