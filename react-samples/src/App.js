import React from 'react';
import store from './store';
import Provider, {connect} from './libs/react-redux';

const Header = ({add, addAfter, pending}) => {
  return !pending && (
    <div>
      <button onClick={() => add()}>Add 1</button>
      <button onClick={() => addAfter()}>Add Async 1</button>
    </div>
  );
};

const ConnectedHeader = connect(
  state => ({
    pending: state.app.pending
  }),
  dispatch => ({
    add: () => dispatch({
      type: 'ADD',
      payload: 1
    }),
    addAfter: () => dispatch({
      type: 'ADD',
      payload: new Promise((resolve, reject) => {
        setTimeout(() => reject(1), 1500);
      })
    })
  })
)(Header);

const Body = ({content}) => {
  return <ul>{content.map((entry, index) => <li key={index}>{entry}</li>)}</ul>;
}

const ConnectedBody = connect(
  state => ({content: state.app.values})
)(Body);

const ShowErrorInConsole = connect(
  state => ({
    action: state.meta.lastAction
  })
)(({action: {type = '', payload} = {}} = {}) => {
  if (!!type.match(/_REJECTED$/)) {
    console.error(`Error occured, last type = ${type} and payload = ${payload}`);
  }
  return null;
});

function App() {
  return (
    <Provider store={store}>
      <ShowErrorInConsole/>
      <ConnectedHeader/>
      <ConnectedBody/>
    </Provider>
  );
}

export default App;
