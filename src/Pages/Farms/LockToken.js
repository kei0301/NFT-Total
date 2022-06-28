import React, { useState, useEffect } from 'react'
import { useMoralis } from "react-moralis";
import { useDispatch, useSelector } from "react-redux"
import { setWalletConnectAction } from "../../store/actions/GlobalActions";
import CalculatorsSvg from "../../Components/Icons/SvgIcons/CalculatorsSvg";
import { BitxAddr, MeatVaultAddr } from '../../config/constances';
import Moralis from "moralis";
import { formatPrice } from "../../utils/formatHelpers"
import { Modal } from "rsuite"
import Meatvault from "../../backend/abis/LockBitx.json";
import Bitx from "../../backend/abis/BEP20.json";
import { Interface } from '@ethersproject/abi'
import BigNumber from "bignumber.js";

export default function LockToken() {

    const dispatch = useDispatch();
    const [toggleDropdown, setToggleDropdown] = useState(false);
    const { isAuthenticated, account } = useMoralis();
    const [ isApproved, setIsApproved ] = useState(false);
    const [ totalStaked, setTotalStaked ] = useState(0);
    const bitxContract = useSelector(s => s.wallet.bitx);
    const vaultContract = useSelector(s => s.wallet.meatVault);
    const busdPrice = useSelector(s => s.global.busdPrice);
    const [ stakeAmount, setStakeAmount ] = useState(0);
    const [ unstakeAmount, setUnstakeAmount ] = useState(0);
    const [ balance, setBalance ] = useState(0);
    const [ userInfo, setUserInfo ] = useState({});
    const [ pendingHarvest, setPendingHarvest ] = useState(0);
    const [ stakeModal, setStakModal ] = useState(false);
    const [ unstakeModal, setUnstakeModal ] = useState(false);
    const [ maxUnstake, setMaxUnstake ]= useState(false);
    const [ enabledWithdraw, setEnabledWithdraw ] = useState(false);
    const multicall = useSelector(s => s.wallet.multicall);

    const fnMulticall = async (abi, calls) => {
      const itf = new Interface(abi)
    
      const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])
      const { returnData } = await multicall.methods.aggregate(calldata).call()
      const res = returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call))

      return res;
    }

    useEffect(() => {
      loadHadler();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [multicall])

    const loadHadler = async () => {
      if(!multicall) return;

      try {
        (async () => {

          if(!isAuthenticated || !account) return;
          let calls = [
            { address: BitxAddr, name: 'allowance', params: [account, MeatVaultAddr] },
            { address: BitxAddr, name: 'balanceOf', params: [account] },
            { address: BitxAddr, name: 'balanceOf', params: [MeatVaultAddr] },
          ]
  
          let res = await fnMulticall(Bitx.abi, calls);
  
          res = res.map(r => new BigNumber(r).toJSON());
          if(res[0] >= res[1]) {
          setIsApproved(true);
          }
          setBalance(res[1]);
          setTotalStaked(res[2]);
  
          calls = [
            { address: MeatVaultAddr, name: 'userInfo', params: [account] },
            { address: MeatVaultAddr, name: 'pendingBusd', params: [account] },
            { address: MeatVaultAddr, name: 'getEnableWithdraw', params: [account] },
          ]
  
          res = await fnMulticall(Meatvault.abi, calls);
  
          res = res.map((r, idx) => {
            if(idx !== 1) return r
            return new BigNumber(r).toJSON()
          });
  
          setUserInfo(res[0]);
          setPendingHarvest(res[1]);
          setEnabledWithdraw(res[2]);
        })()
      }catch (e) {
        console.log(e)
      }
    }

    const enableBitxHandler = async () => {
      try {
        const _balance = await bitxContract.methods.balanceOf(account).call();
        await bitxContract.methods.approve(MeatVaultAddr, _balance).send({from: account});
        setIsApproved(true);
      }catch (e){
        console.log(e)
      }
    }

    const harvestHandler = async () => {
      try{
        await vaultContract.methods.withdraw(0).send({from: account});
        loadHadler();
      }catch { }
    }

    const stakeBitxHandler = async () => {
      try{
        await vaultContract.methods.deposit(Moralis.Units.ETH(stakeAmount)).send({from: account});
        setStakeAmount(0);
        loadHadler();
      }catch { }
    }

    const unstakeBitxHandler = async () => {
      try{
        if(maxUnstake) {
          await vaultContract.methods.withdraw(userInfo.amount).send({from: account});
        }else {
          await vaultContract.methods.withdraw(Moralis.Units.ETH(unstakeAmount)).send({from: account});
        }
        setUnstakeAmount(0);
        loadHadler();
      }catch { }
    }
  
    return (
      <section id="Section2">
        <div className="section_container">
          <div className="section_body">
            <div className="section_box_wrapper">
              <div className="section_body_box_1">
                <img src={"./img/img_b.png"} alt="img" />
                <ul className="section_content_list">
                  <li>VIP Pool</li>
                  <li>Stake BITX to earn BUSD and User Tier</li>
                  <li>
                    APR 33.08% <CalculatorsSvg />
                  </li>
                  <li>
                    Total Staked
                    <strong>{ formatPrice(totalStaked) } BITX</strong>
                  </li>
                </ul>
              </div>
              <div className="section_body_box_2">
                <div className="section_box_2_content">
                  <ul className="section_content_list">
                    <li>
                      Your current tier <span>No Tier</span>
                    </li>
                    <li>Token will be locked 180 days</li>
  
                    <li>
                      <span>Earned</span>
                      <strong>{ formatPrice(pendingHarvest) } </strong>
                    </li>
                    <li className="dropdown_btn_list_wrapper">
                      <button
                        className="dropdown_btn"
                        onClick={() => setToggleDropdown(!toggleDropdown)}
                      >
                        {toggleDropdown ? "Hide" : "Detail"}
                        {toggleDropdown ? (
                          <svg
                            style={{ transform: "scaleY(-1)" }}
                            width={14}
                            height={14}
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7 8.75L7.41248 9.16248L7 9.57496L6.58752 9.16248L7 8.75ZM10.9125 5.66248L7.41248 9.16248L6.58752 8.33752L10.0875 4.83752L10.9125 5.66248ZM6.58752 9.16248L3.08752 5.66248L3.91248 4.83752L7.41248 8.33752L6.58752 9.16248Z"
                              fill="#FAB674"
                            />
                          </svg>
                        ) : (
                          <svg
                            width={14}
                            height={14}
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M7 8.75L7.41248 9.16248L7 9.57496L6.58752 9.16248L7 8.75ZM10.9125 5.66248L7.41248 9.16248L6.58752 8.33752L10.0875 4.83752L10.9125 5.66248ZM6.58752 9.16248L3.08752 5.66248L3.91248 4.83752L7.41248 8.33752L6.58752 9.16248Z"
                              fill="#FAB674"
                            />
                          </svg>
                        )}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
  
              {toggleDropdown && (
                <div className="dropdown_content_box">
                  <div className="content_box">
                    <ul>
                      <li>
                        <strong>Withdraw Fee 0%</strong>
                      </li>
                      <li>
                        <a href={`https://pancakeswap.finance/swap?outputCurrency=${BitxAddr}`} target="_blank" className="content_link" rel="noreferrer">
                          Get BITX{" "}
                          <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth={0}
                            viewBox="0 0 512 512"
                            className="inline text-base ml-1"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={32}
                              d="M384 224v184a40 40 0 01-40 40H104a40 40 0 01-40-40V168a40 40 0 0140-40h167.48M336 64h112v112M224 288L440 72"
                            />
                          </svg>
                        </a>
                      </li>
                      <li>
                        <a href={`https://bscscan.com/address/${MeatVaultAddr}`} className="content_link">
                          View contract{" "}
                          <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth={0}
                            viewBox="0 0 512 512"
                            className="inline text-base ml-1"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={32}
                              d="M384 224v184a40 40 0 01-40 40H104a40 40 0 01-40-40V168a40 40 0 0140-40h167.48M336 64h112v112M224 288L440 72"
                            />
                          </svg>
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="content_box">
                    <div className="card_box">
                      <ul>
                        <li>
                          <strong>Meat earned</strong>
                        </li>
                        <li>
                          <span>{ formatPrice(pendingHarvest) } </span>
                        </li>
                        <li>
                          <span>~${formatPrice(pendingHarvest)*busdPrice}</span>
                        </li>
                      </ul>
                      <button className={ pendingHarvest > 0 ? "btn_harvest" : "btn_harvest_inactive" } onClick={harvestHandler} >Harvest</button>
                    </div>
                  </div>
                  <div className="content_box">
                    <div className="card_box mx_0">
                      {
                          (!isAuthenticated || !isApproved) &&
                          <strong className="mb_sizer2">Start Staking</strong>
                      }
                      {
                        isAuthenticated ?
                          isApproved ?
                          (
                            <>
                              <button className="btn_connect_wallet mb-2" onClick={() => setStakModal(true)} disabled={!(balance > 0)}>Stake</button>
                              <button className="btn_connect_wallet mt-3" onClick={() => enabledWithdraw && setUnstakeModal(true)} disabled={!(pendingHarvest > 0)}>UnStake</button>
                            </>
                          ) 
                          :
                          <button className="btn_connect_wallet" onClick={enableBitxHandler}>Enable</button>
                          :
                          <button className="btn_connect_wallet" onClick={() => {
                            dispatch(setWalletConnectAction(true));
                          }}>Connect Wallet</button>
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Modal open={stakeModal} onClose={() => setStakModal(false)}  style={{marginTop: "100px"}}>
          <Modal.Body>
            <div style={{maxWidth: "400px", margin: "auto"}}>
            <div className='row mb-3'>
                <div className='col-9 form-group'>
                  <input className="form-control" type="number" onChange={e => setStakeAmount(e.target.value)} value={stakeAmount}/>
                </div>
                <div className='col-3'>
                  <button className="btn_max" onClick={() => {
                    setStakeAmount(balance/Math.pow(10, 18))
                  }}>Max</button>
                </div>
              </div>
              <button className="btn_connect_wallet" 
                disabled={balance/Math.pow(10, 18) < stakeAmount}
                onClick={() => stakeBitxHandler()}
                >Confirm</button>
            </div>
          </Modal.Body>
        </Modal>

        <Modal open={unstakeModal} onClose={() => setUnstakeModal(false)}  style={{marginTop: "100px"}}>
          <Modal.Body>
            <div style={{maxWidth: "400px", margin: "auto"}}>
              <div className='row mb-3'>
                <div className='col-9 form-group'>
                  <input className="form-control" type="number" onChange={e => setUnstakeAmount(e.target.value)} value={unstakeAmount}/>
                </div>
                <div className='col-3'>
                  <button className="btn_max" onClick={() => {
                    setMaxUnstake(true)
                    setUnstakeAmount(formatPrice(userInfo?.amount))
                  }}>Max</button>
                </div>
              </div>
              <button className="btn_connect_wallet" 
              disabled={(userInfo?.amount)/Math.pow(10, 18) < unstakeAmount}
              onClick={() => unstakeBitxHandler()}
              >Confirm</button>
            </div>
          </Modal.Body>
        </Modal>
        
      </section>
    );
}
