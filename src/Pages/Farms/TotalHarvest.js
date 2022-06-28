import React, { useEffect, useState } from 'react'
import { useMoralis, useTokenPrice, useERC20Balances } from "react-moralis";
import { useDispatch, useSelector } from "react-redux"
import { BitxAddr, BUSDAddr } from '../../config/constances';
import { setbusdPriceAction, setWalletConnectAction } from "../../store/actions/GlobalActions";
import { formatPrice } from '../../utils/formatHelpers';
import BEP20 from "../../backend/abis/BEP20.json";
import { Interface } from '@ethersproject/abi'
import BigNumber from 'bignumber.js';

export default function TotalHarvest() {

    const { isAuthenticated, account } = useMoralis();
    const dispatch = useDispatch();
    const masterChefContract = useSelector(s => s.wallet.masterChef);
    const meatVaultContract = useSelector(s => s.wallet.meatVault);
    const [ pendingAmount, setPendingAmount ] = useState(0);
    const { data: busdPrice } = useTokenPrice({chain: "bsc", address: BUSDAddr.toLowerCase()})
    const { data: bitxPrice } = useTokenPrice({chain: "bsc", address: "0xBb622cEba240980B3D6A200108e1753bc928ADb3".toLowerCase()})
    const multicall = useSelector(s => s.wallet.multicall);
    const [ bitxBalance, setBitBalance ] = useState(0);
    const [ busdBalance, setBusdBalance ] = useState(0);
    const [ userInfo, setUserInfo ] = useState({});
    const [ canClaim, setCanClaim ] = useState(false);
    const { data: assets } = useERC20Balances();

    const fnMulticall = async (abi, calls) => {
      const itf = new Interface(abi)
    
      const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])
      const { returnData } = await multicall.methods.aggregate(calldata).call()
      const res = returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call))

      return res;
    }

    useEffect(() => {
      let token = assets?.find(a => a.token_address === BUSDAddr);
      if(typeof token !== "undefined" && token?.balance !== null) {
        setBitBalance(token.balance)
      }
    }, [assets])

    useEffect(() => {
      loadHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [masterChefContract, account, isAuthenticated])

    const loadHandler = async () => {
      if(!masterChefContract || !account) return;
      (async () => {
        try {

          if(isAuthenticated) {
            const amount = await masterChefContract.methods.pendingAllBusd(account).call();
            const _userInfo = await meatVaultContract.methods.userInfo(account).call();
            const _canClaim = await meatVaultContract.methods.getEnableWithdraw(account).call();
            setPendingAmount(amount);
            setUserInfo(_userInfo)
            setCanClaim(_canClaim)
  
            let calls = [
              { address: BUSDAddr, name: 'balanceOf', params: [account] },
            ]
  
            let res = await fnMulticall(BEP20.abi, calls);
            res = res.map(v => new BigNumber(v).toJSON());
            setBusdBalance(res[0]);
          }
         
        }catch (e){
          console.log(e)
        }
      })()
    }

    const harvestAllHandler = async () => {
      await masterChefContract.methods.emergencyAllHarvest().send({from: account});
      loadHandler()
    }

    const claimHandler = async () => {
      await masterChefContract.methods.emergencyAllWithdraw().send({from: account});
      loadHandler()
    }
    
    return (
      <section id="Section1">
        <div className="section_container">
          <div className="section_title">
            <h2 className="title">Farms</h2>
          </div>
          <div className="section_body">
            <div className="section_flex">
              <div className="flex_box">
                <div className="meat_box">
                  <strong>Meat Earned</strong>
                  <strong>{formatPrice(pendingAmount)}</strong>
                  <span>~${(formatPrice(pendingAmount) * busdPrice?.usdPrice).toFixed(3)}</span>
                  <svg
                    style={{ cursor: "pointer" }}
                    title="title"
                    width={10}
                    height={10}
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g opacity="0.8">
                      <circle
                        cx={5}
                        cy={5}
                        r="3.75"
                        stroke="#664900"
                        strokeWidth="0.833333"
                      />
                      <circle
                        cx="4.99996"
                        cy="7.49999"
                        r="0.208333"
                        fill="#664900"
                        stroke="#664900"
                        strokeWidth="0.416667"
                      />
                      <path
                        d="M5 6.66666V6.07546C5 5.68203 5.25176 5.33274 5.625 5.20832V5.20832C5.99824 5.08391 6.25 4.73462 6.25 4.34118V4.12736C6.25 3.45871 5.70795 2.91666 5.03929 2.91666H5C4.30964 2.91666 3.75 3.4763 3.75 4.16666V4.16666"
                        stroke="#664900"
                        strokeWidth="0.833333"
                      />
                    </g>
                  </svg>
  
                  <img
                    className="img_frame"
                    src={"./img/meat_box_frame.png"}
                    alt="img"
                  />
                </div>
                <ul className="flex_box_list_content">
                  <li>
                    Ready to claim :<strong>
                      { formatPrice(userInfo?.amount) }
                    </strong>
                  </li>
                  {/* <li>
                    To be claimed in 15 days :<strong>0.000</strong>
                  </li>
                  <li>
                    (Auto renew 15 days release when you harvest <br /> again)
                  </li> */}

                  <li>
                    {
                      isAuthenticated ?
                      (
                        <>
                          <button className="btn btn-secondary m-2" onClick={harvestAllHandler} disabled={! (pendingAmount > 0) }>Harvest All</button>
                          <button className="btn btn-secondary" onClick={claimHandler} disabled={!canClaim || !(pendingAmount > 0)}>Claim</button>
                        </>
                      )
                      :
                      <button className="btn_connect_wallet" onClick={() => {
                        dispatch(setWalletConnectAction(true));
                      }}>Connect Wallet</button>
                    }
                  </li>
                </ul>
              </div>
              <div className="flex_box wallet_balance_flex">
                <ul className="wallet_balance_list">
                  <li>
                    <img src={"./img/img_b.png"} alt="" />
                    <div className="content_box">
                      <h3>BUSD Wallet Balance</h3>
                      <strong>{ formatPrice(busdBalance) }</strong>
                      <span>~${ (formatPrice(busdBalance)*busdPrice?.usdPrice).toFixed(3) }</span>
                    </div>
                    <div className="btn_box">
                      <button>
                        <a href={`https://pancakeswap.finance/swap?outputCurrency=${BUSDAddr}`} target="_blank" rel="noreferrer" style={{color: "white"}} className="no_line">Buy BUSD</a>
                      </button>
                    </div>
                  </li>
  
                  <li>
                    <img
                      style={{ height: "2.5rem", marginLeft: "1.2rem" }}
                      src={"./img/meat_box_frame.png"}
                      alt=""
                    />
                    <div className="content_box">
                      <h3>BITX Wallet Balance</h3>
                      <strong>{ formatPrice(bitxBalance) }</strong>
                      <span>~${ (formatPrice(bitxBalance) * bitxPrice?.usdPrice).toFixed(3) }</span>
                    </div>
                    <div className="btn_box">
                      <button>
                        <a href={`https://pancakeswap.finance/swap?outputCurrency=${BitxAddr}`} target={"_blank"} rel="noreferrer" style={{color: "white"}} className="no_line">Buy BITX</a>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
}
