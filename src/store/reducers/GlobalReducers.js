import { SET_LOADING, SET_WALLET_CONNECT, SET_LOADING_LABEL, SET_MEAT_PRICE } from "../actions/GlobalActions";

const globalReducer = (state = { isLoading: false, isWalletConnect: false, busdPrice: 0.1  }, { type, payload }) =>{
	switch(type){
		case SET_LOADING: 
			return {
				...state,
				isLoading: payload,
			};
		case SET_WALLET_CONNECT: 
			return {
				...state,
				isWalletConnect: payload,
			};
		case SET_LOADING_LABEL:
			return  {
				...state,
				loadingLabel: payload
			}
		case SET_MEAT_PRICE:
			return  {
				...state,
				busdPrice: payload
			}
		default:
			return state;
	}
}
export default globalReducer;