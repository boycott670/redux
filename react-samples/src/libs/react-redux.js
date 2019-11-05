import React, {createContext, Component} from 'react';

const ProviderContext = createContext();

class Watcher extends Component {
	constructor(props) {
		super(props);

		this.state = {
			subscriber: props.subscribe(() => {
				this.forceUpdate();
			})
		};
	}

	componentWillUnmount() {
		this.state.subscriber();
	}

	render() {
		return this.props.children();
	}
}

export function connect(mapStateToProps = () => ({}), mapDispatchToProps = () => ({})) {
	return Component => {
		return (props = {}) => {
			return (
				<ProviderContext.Consumer>
					{
						store => (
							<Watcher subscribe={store.subscribe}>
								{
									() => <Component {...mapStateToProps(store.getState())} {...mapDispatchToProps(store.dispatch)} {...props}/>
								}
							</Watcher>
						)
					}
				</ProviderContext.Consumer>
			);
		};
	};
};

export default function Provider ({store, children} = {}) {
	return (
		<ProviderContext.Provider value={store}>
			{children}
		</ProviderContext.Provider>
	);
};