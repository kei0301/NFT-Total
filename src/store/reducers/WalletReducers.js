import { SET_BITX, SET_MASTERCHEF, SET_MEAT, SET_MEATVAULT, SET_MULTICALL, SET_WEB3 } from "../actions/WalletActions"


const walletReducer = (state = { }, { type, payload }) =>{
	switch (type) {
		case SET_WEB3:
		  return {
			  ...state,
			  web3: payload
			}
		case SET_BITX:
			return {
				...state,
				bitx: payload
				}
		case SET_MEAT:
			return {
				...state,
				meat: payload
				}
		case SET_MASTERCHEF:
			return {
				...state,
				masterChef: payload
				}
		case SET_MEATVAULT:
			return {
				...state,
				meatVault: payload
				}
		case SET_MULTICALL:
			return {
				...state,
				multicall: payload
				}
		default:
		  return state
	  }
}
export default walletReducer;