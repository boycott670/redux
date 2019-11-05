const now = ((start = 0) => {
	let id = start;
	return () => {
		id = id + 1;
		return id;
	};
})();

const applyMiddlewares = (...mws) => {
	return (store, id) => {
		return mws.reduceRight(
			(res, curr) => curr(store)(res),
			id
		);
	};
}

export default (reducer, mw = applyMiddlewares()) => {
	return (function () {
		let state = reducer(undefined, {type: 'INIT'});
		let subscribers = {};
		const store = {
			getState: () => state,
			dispatch: function (action) {
				mw(this, action => {
					state = reducer(state, action);
					for (const id in subscribers) subscribers[id]();
				})(action);
			},
			subscribe: cb => {
				const id = now();

				subscribers = {...subscribers, [id]: cb};

				return () => {
					subscribers = {...subscribers, [id]: () => {}};
				};
			}
		};
		for (const key in store) {
			if (typeof store[key] === 'function') {
				store[key] = store[key].bind(store);
			}
		}
		return store;
	})();
};

export {applyMiddlewares as applyMiddleware};

export const combineReducers = reducers => {
	return (state, action) => {
		return Object.keys(reducers).reduce((acc, reducer) => {
			return {...acc, [reducer]: reducers[reducer]((state || {[reducer]: undefined})[reducer], action)};
		}, {});
	};
};