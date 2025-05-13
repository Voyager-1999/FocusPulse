import {createRouter,createWebHashHistory} from 'vue-router'

import TomatoClock from '../views/TomatoClock.vue'
import ClassSchedule from '../views/ClassSchedule.vue'
import DayToDo from '../views/DayToDo.vue'
import RecentToDo from '../views/RecentToDo.vue'
import Overview from '../views/Overview.vue'

const router = createRouter({
	history:createWebHashHistory(),
	routes:[
		{
			path:'/',
			redirect:'/DayToDo'	
		},
		{
			name:'DayToDo',
			path:'/DayToDo',
			component:DayToDo,
		},
		{
			name:'RecentToDo',
			path:'/RecentToDo',
			component:RecentToDo
		},
		{
			name:'Overview',
			path:'/Overview',
			component:Overview
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