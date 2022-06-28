export const SET_LOADING = "SET_LOADING";

export const SET_TYPE = "SET_TYPE"

export const SET_TYPES = "SET_TYPES"

export const SET_LOADING_LABEL = "SET_LOADING_LABEL";

export const SET_WALLET_CONNECT  = "SET_WALLET_CONNECT";

export const SET_MEAT_PRICE  = "SET_MEAT_PRICE";

export const setLoadingAction = state => ({ type: SET_LOADING, payload: state })

export const setLoadingLabelAction = label => ({ type: SET_LOADING_LABEL, payload: label});

export const setWalletConnectAction = state => ({ type: SET_WALLET_CONNECT, payload: state });

export const setbusdPriceAction = price => ({ type: SET_MEAT_PRICE, payload: price });

