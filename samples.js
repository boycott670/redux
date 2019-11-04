const {createStore, applyMiddleware, combineReducers} = require('./redux');
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

const doAfter = (cb, after) => new Promise((resolve, reject) => {
	setTimeout(() => {
		cb({resolve, reject});
	}, after);
});

const resolveByAfter = (by, after) => doAfter(({resolve}) => resolve(by), after);

const rejectByAfter = (by, after) => doAfter(({reject}) => reject(by), after);

const valuesReducer = (state = [], action) => {
	if (!!action.type.match(/^ADD(_FULFILLED)?$/))
		return [...state, action.payload];
	return state;
};

const pendingReducer = (state = false, action) => {
	return !!action.type.match(/_PENDING$/);
}

const store = createStore(combineReducers({values: valuesReducer, pending: pendingReducer}), applyMiddleware(promise(after => `${(after / 1000).toFixed(2)}s`), logger));

store.dispatch({type: 'ADD', payload: 1});
store.dispatch({type: 'ADD', payload: 2});

store.subscribe(() => {
	log('state changed !');
});

store.subscribe(() => {
	log('state changed x2!');
});

store.dispatch({type: 'ADD', payload: 3});
store.dispatch({type: 'ADD', payload: 4});

store.dispatch({
	type: 'ADD',
	payload: resolveByAfter(5, 650),
	meta: {
		some: 'thing'
	}
});
