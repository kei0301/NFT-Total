export const SET_WEB3 = "SET_WEB3";

export const SET_BITX = "SET_BITX";

export const SET_MEAT = "SET_MEAT";

export const SET_MASTERCHEF = "SET_MASTERCHEF";

export const SET_MEATVAULT = "SET_MEATVAULT";

export const SET_MULTICALL = "SET_MULTICALL";

export const setWeb3Action = web3 => ({ type: SET_WEB3, payload: web3 });

export const setBitxContractAction = contract => ({ type: SET_BITX, payload: contract });

export const setMeatContractAction = contract => ({ type: SET_MEAT, payload: contract });

export const setMasterChefContractAction = contract => ({ type: SET_MASTERCHEF, payload: contract });

export const setMeatVaultContractAction = contract => ({ type: SET_MEATVAULT, payload: contract });

export const setMulticallAction = data => ({ type: SET_MULTICALL, payload: data });

