import createStore, {applyMiddleware, combineReducers} from './libs/redux';
const {log} = console;

const logger = ({getState}) => next => action => {
	const prev = getState();
	next(action);
	log({prev, action, next: getState()});
}

const now = () => new Date().getTime();

const promise = (after = e => e) => ({dispatch}) => next => action => {
	if (!(action.payload instanceof Promise)) {
		next(action);
		return;
	}

	dispatch({type: `${action.type}_PENDING`});

	const meta = at => {
		const period = () => after(now() - at);
		return {
			...(action.meta || {}),
			after: period()
		};
	}

	const at = now();

	action.payload
		.then(response => dispatch({
			type: `${action.type}_FULFILLED`,
			payload: response,
			meta: meta(at)
		}))
		.catch(error => dispatch({
			type: `${action.type}_REJECTED`,
			payload: error,
			meta: meta(at)
		}));
};

const valuesReducer = (state = [], action) => {
	if (!!action.type.match(/^ADD(_FULFILLED)?$/))
		return [...state, action.payload];
	return state;
};

const pendingReducer = (state = false, action) => {
	return !!action.type.match(/_PENDING$/);
}

const lastActionReducer = (state, action) => {
	return {
		lastAction : action
	};
}

export default createStore(combineReducers({meta: lastActionReducer, app: combineReducers({values: valuesReducer, pending: pendingReducer})}), applyMiddleware(promise(after => `${(after / 1000).toFixed(2)}s`), logger));
