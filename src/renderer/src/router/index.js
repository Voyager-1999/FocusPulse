import {createRouter,createWebHashHistory} from 'vue-router'

import TomatoClock from '../views/TomatoClock.vue'
import ClassSchedule from '../views/ClassSchedule.vue'
import DayToDo from '../views/DayToDo.vue'
import RecentToDo from '../views/RecentToDo.vue'
import Overview from '../views/Overview.vue'
import DataAnalysis from '../views/DataAnalysis.vue'
import YesterdaySummary from '../views/YesterdaySummary.vue'
import TodoStatistic from '../views/TodoStatistic.vue'
import TomatoStatistic from '../views/TomatoStatistic.vue'
import Report from '../views/Report.vue'
import User from '../views/User.vue'


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
		},
		{
			name:'DataAnalysis',
			path:'/DataAnalysis',
			component:DataAnalysis,
			redirect:'/DataAnalysis/YesterdaySummary',
			children:[
				{
					path: '',
					name: 'DataAnalysisDefault',
					component: YesterdaySummary
				},
				{
					name:'YesterdaySummary',
					path:'YesterdaySummary',
					component:YesterdaySummary
				},
				{
					name:'TodoStatistic',
					path:'TodoStatistic',
					component:TodoStatistic
				},
				{
					name:'TomatoStatistic',
					path:'TomatoStatistic',
					component:TomatoStatistic
				},
				{
					name:'Report',
					path:'Report',
					component:Report
				}
			]
		},
		{
			name:'User',
			path:'/User',
			component:User
		}
	]
})

export default router