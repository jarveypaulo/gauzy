import { ipcMain } from 'electron';
import { TimerData } from '../local-data/timer';
import { metaData } from '../local-data/coding-activity';
import TimerHandler from './timer';
import moment from 'moment';
import { LocalStore } from './getSetStore';
import { writeFileSync } from 'fs';
import { app } from 'electron';
export function ipcMainHandler(store, startServer, knex) {
	ipcMain.on('start_server', (event, arg) => {
		global.variableGlobal = {
			API_BASE_URL: arg.serverUrl
				? arg.serverUrl
				: arg.port
				? `http://localhost:${arg.port}`
				: 'http://localhost:3000'
		};
		startServer(arg);
	});

	ipcMain.on('data_push_activity', (event, arg) => {
		arg.windowEvent.forEach((item) => {
			const events = {
				eventId: item.id,
				timerId: arg.timerId,
				durations: item.duration,
				data: JSON.stringify(item.data),
				created_at: new Date(),
				updated_at: new Date(),
				activityId: null
			};
			TimerData.insertWindowEvent(knex, events);
		});
	});

	ipcMain.on('data_push_afk', (event, arg) => {
		arg.afk.forEach((item) => {
			const now = moment().utc();
			const afkDuration = now.diff(moment(arg.start).utc(), 'seconds');
			if (afkDuration < item.duration) {
				item.duration = afkDuration;
			}
			const afk_new = {
				eventId: item.id,
				durations: item.duration,
				timerId: arg.timerId,
				data: JSON.stringify(item.data),
				created_at: new Date(),
				updated_at: new Date(),
				timeSlotId: null,
				timeSheetId: null
			};

			TimerData.insertAfkEvent(knex, afk_new);
		});
	});

	ipcMain.on('remove_aw_local_data', (event, arg) => {
		TimerData.deleteWindowEventAfterSended(knex, {
			activityIds: arg.idsAw
		});
	});

	ipcMain.on('remove_wakatime_local_data', (event, arg) => {
		metaData.removeActivity(knex, {
			idsWakatime: arg.idsWakatime
		});
	});

	ipcMain.on('remove_afk_local_Data', (event, arg) => {
		TimerData.deleteAfk(knex, {
			idAfk: arg.idAfk
		});
	});

	ipcMain.on('return_time_slot', (event, arg) => {
		TimerData.updateTimerUpload(knex, {
			id: arg.timerId,
			timeSlotId: arg.timeSlotId
		});
	});

	ipcMain.on('return_time_sheet', (event, arg) => {
		console.log('timesheet return', arg);
		TimerData.updateTimerUpload(knex, {
			id: arg.timerId,
			timeSheetId: arg.timeSheetId,
			timeLogId: arg.timeLogId
		});
	});

	ipcMain.on('return_time_log', (event, arg) => {
		TimerData.updateTimerUpload(knex, {
			id: arg.timerId,
			timeLogId: arg.timeLogId
		});
	});

	ipcMain.on('set_project_task', (event, arg) => {
		event.sender.send('set_project_task_reply', arg);
	});

	ipcMain.on('time_tracker_ready', (event, arg) => {
		console.log('open time tracker');
		const auth = LocalStore.getStore('auth');
		if (auth) {
			event.sender.send(
				'timer_tracker_show',
				LocalStore.beforeRequestParams()
			);
		}
	});

	ipcMain.on('screen_shoot', (event, arg) => {
		event.sender.send('take_screen_shoot');
	});

	ipcMain.on('save_screen_shoot', (event, arg) => {
		console.log('save');
		try {
			writeFileSync(
				`${app.getPath('userData')}/screen_shoot-${moment().format(
					'YYYYMMDDHHmmss'
				)}.png`,
				arg.buffer
			);
		} catch (error) {
			console.log('error', error);
		}
	});
}

export function ipcTimer(store, knex, win2, win3) {
	const timerHandler = new TimerHandler();
	ipcMain.on('start_timer', (event, arg) => {
		store.set({
			project: {
				projectId: arg.projectId,
				taskId: arg.taskId,
				note: arg.note,
				aw: arg.aw
			}
		});
		timerHandler.startTimer(win2, knex, win3);
		timerHandler.updateTime(win2, knex, win3);
	});

	ipcMain.on('stop_timer', (event, arg) => {
		timerHandler.stopTime(win2, win3, knex);
	});
}
