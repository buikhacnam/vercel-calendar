export enum WorkingActionTypes {
	GET_WORKING_REQUEST = 'GET_WORKING_REQUEST',
	GET_WORKING_SUCCESS = 'GET_WORKING_SUCCESS',
	GET_WORKING_FAILURE = 'GET_WORKING_FAILURE',
	GET_WORKING_CLEAR_ERROR = 'GET_WORKING_CLEAR_ERROR',

	SELECT_WORKING_ITEM = 'SELECT_WORKING_ITEM',
	CLEAR_SELECTED_WORKING_ITEM = 'CLEAR_SELECTED_WORKING_ITEM',

	OPEN_WORKING_DRAWER = 'OPEN_WORKING_DRAWER',
	CLOSE_WORKING_DRAWER = 'CLOSE_WORKING_DRAWER',
	UNMOUNT_WORKING_DRAWER = 'UNMOUNT_WORKING_DRAWER',
	MOUNT_WORKING_DRAWER = 'MOUNT_WORKING_DRAWER',
	TOGGLE_WORKING_DETAIL_DRAWER = 'TOGGLE_WORKING_DETAIL_DRAWER',

	CREATE_WORKING_REQUEST = 'CREATE_WORKING_REQUEST',
	CREATE_WORKING_SUCCESS = 'CREATE_WORKING_SUCCESS',
	CREATE_WORKING_FAILURE = 'CREATE_WORKING_FAILURE',
}
