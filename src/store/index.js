import { applyMiddleware, combineReducers, compose,createStore,} from 'redux';
import thunk from 'redux-thunk';
//import rootReducers from './reducers/Index';
import { reducer as reduxFormReducer } from 'redux-form';
import { createLogger } from 'redux-logger'
import { composeWithDevTools } from 'redux-devtools-extension';
import wallet from './reducers/WalletReducers';
import globalReducer from './reducers/GlobalReducers';

const asyncDispatchMiddleware = store => next => action => {
    let syncActivityFinished = false;
    let actionQueue = [];

    function flushQueue() {
        actionQueue.forEach(a => store.dispatch(a)); // flush queue
        actionQueue = [];
    }

    function asyncDispatch(asyncAction) {
        actionQueue = actionQueue.concat([asyncAction]);

        if (syncActivityFinished) {
            flushQueue();
        }
    }

    const actionWithAsyncDispatch =
        Object.assign({}, action, { asyncDispatch });

    const res = next(actionWithAsyncDispatch);

    syncActivityFinished = true;
    flushQueue();

    return res;
};

const middlewares = [thunk, asyncDispatchMiddleware];
let composeEnhancers = compose;

if(!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    middlewares.push(createLogger());
    composeEnhancers = composeWithDevTools
}

const middleware = applyMiddleware(...middlewares);


const reducers = combineReducers({
    wallet,
    global: globalReducer,
	form: reduxFormReducer,	
});


//const store = createStore(rootReducers);

export default createStore(reducers, undefined,  composeEnhancers(middleware));
