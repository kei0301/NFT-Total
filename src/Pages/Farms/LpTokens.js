import React, { useState, useEffect, useMemo } from 'react'
import { useMoralis } from "react-moralis";
import { useDispatch, useSelector } from "react-redux"
import { setWalletConnectAction } from "../../store/actions/GlobalActions";
import CalculatorsSvg from "../../Components/Icons/SvgIcons/CalculatorsSvg";
import { formatPrice } from "../../utils/formatHelpers"
import { Modal } from "rsuite"
import Moralis from "moralis";
import { Farms, MasterChefAddr, TotalAllocPoint } from '../../config/constances';
import { Interface } from '@ethersproject/abi'
import MasterChef from "../../backend/abis/MasterChef.json";
import LpToken from "../../backend/abis/lpToken.json";
import BEP20 from "../../backend/abis/BEP20.json";
import { getFarmApr } from '../../utils/getApr';
import BigNumber from "bignumber.js"

export default function LpTokens() {

  const [tabActive, setTabActive] = useState(true);
  const dispatch = useDispatch();
  const [ stakeModal, setStakModal ] = useState(false);
  const [ unstakeModal, setUnstakeModal ] = useState(false);
  const [ maxUnstake, setMaxUnstake ]= useState(false);
  const [ maxStake, setMaxStake ] = useState(false);
  const [ stakeAmount, setStakeAmount ] = useState(0);
  const [ unstakeAmount, setUnstakeAmount ] = useState(0);
  const masterChefContract = useSelector(s => s.wallet.masterChef);
  const multicall = useSelector(s => s.wallet.multicall);
  const busdPrice = useSelector(s => s.global.busdPrice);
  const web3 = useSelector(s => s.wallet.web3);
  const [ selPid, setSelPid ] = useState(0);
  const [ isOnlyStaked, setIsOnlyStaked ] = useState(false);
    
  const [isDropdownEnabled, setIsDropdownEnabled] = useState([]);
  const { isAuthenticated, account } = useMoralis();
  const [ approves, setApproves ] = useState([]);
  const [ lpFarms, setLpFarms ] = useState([]);

  const fnMulticall = async (abi, calls) => {
    const itf = new Interface(abi)
  
    const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)])
    const { returnData } = await multicall.methods.aggregate(calldata).call()
    const res = returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call))

    return res;
  }


  useEffect(() => {

    loadHandler();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multicall, isOnlyStaked, account])

  const loadHandler = async () => {
    if(!multicall || (isAuthenticated && !account)) return;
    try {
      (async () => {

        let _approves = [];
  
        let _lpFarms = [];
        for(let i=0 ; i<Farms.length ; i++)
        {
  
          let allowance = 0;
          let balance = 0;
          let earned  = 0;
          let liquidity = 0;
          let multiplier = 0;
          let detail = {};
          let calls = [];
          let poolWeight = 0;
          let apr = 0;
  
          if(isAuthenticated) {
            console.log(account)
            let calls = [
              { address: Farms[i].lpAddresses, name: 'allowance', params: [account, MasterChefAddr] },
              { address: Farms[i].lpAddresses, name: 'balanceOf', params: [account] },
              { address: Farms[i].lpAddresses, name: 'balanceOf', params: [MasterChefAddr] },
            ]
    
            let res = await fnMulticall(BEP20.abi, calls);

            calls = [
              { address: MasterChefAddr, name: 'poolInfo', params: [Farms[i].pid] },
              { address: MasterChefAddr, name: 'userInfo', params: [Farms[i].pid, account] },
              { address: MasterChefAddr, name: 'pendingBusd', params: [Farms[i].pid, account] },
            ]
    
            let res1 = await fnMulticall(MasterChef.abi, calls);
    
            poolWeight = TotalAllocPoint ? res1[0].allocPoint/new BigNumber(TotalAllocPoint) : new BigNumber(0)
            earned = new BigNumber(res1[2]).toJSON();
            multiplier = new BigNumber(res1[0].allocPoint/100).toJSON();
            detail = res1[1];
    
            if(res[0] >= res[1]) {
              _approves.push(Farms[i].pid)
            }
            allowance = new BigNumber(res[0]).toJSON();
            balance = new BigNumber(res[1]).toJSON();
            liquidity = new BigNumber(res[2]).toJSON();
            apr = (getFarmApr(poolWeight, 9, formatPrice(res[2])*0.1, Farms[i].lpAddresses).cakeRewardsApr)?.toFixed(3);
  
          }else {
            calls = [
              { address: Farms[i].lpAddresses, name: 'balanceOf', params: [MasterChefAddr] },
            ]
            
            
            let res = await fnMulticall(BEP20.abi, calls);
            
            calls = [
              { address: MasterChefAddr, name: 'poolInfo', params: [Farms[i].pid] },
            ]
            let res1 = await fnMulticall(MasterChef.abi, calls);

            poolWeight = TotalAllocPoint ? res1[0].allocPoint/new BigNumber(TotalAllocPoint) : new BigNumber(0)
            multiplier = new BigNumber(res1[0].allocPoint/100).toJSON();

            liquidity = new BigNumber(res[0]).toJSON()
          }
  
  
          let newLp = {
            ...Farms[i],
            allowance,
            balance,
            earned,
            liquidity,
            multiplier,
            poolWeight,
            apr,
            detail,
          };
          if(isOnlyStaked) {
            if(detail?.amount > 0) {
              _lpFarms.push(newLp);
            }
          }else {
            _lpFarms.push(newLp);
          }
  
        }
        setLpFarms(_lpFarms)
        setApproves(_approves);
      })()
    }catch (e) {
      console.log(e)
    }
  }

  // window.sessionStorage.removeItem("num");
  const dropdownDetailsHandle = (pid) => {
    if(isDropdownEnabled.includes(pid)) {
      setIsDropdownEnabled(isDropdownEnabled.filter(d => d !== pid));
    }else {
      setIsDropdownEnabled([...isDropdownEnabled, pid]);
    }
  };

  const enableBitxHandler = async (pid, lpAddress) => {

    try {

      const lpContract = new web3.eth.Contract(LpToken, lpAddress);
      const balance = await lpContract.methods.balanceOf(account).call();
      await lpContract.methods.approve(MasterChefAddr, balance).send({from: account});
      setApproves([...approves, pid])
    }catch (e){
      console.log(e)
    }
  }

  const harvestHandler = async (pid) => {
    try{
      await masterChefContract.methods.withdraw(pid, 0).send({from: account});
      loadHandler();
    }catch { }
  }

  const stakeBitxHandler = async () => {
    try{
      await masterChefContract.methods.deposit(selPid, Moralis.Units.ETH(stakeAmount)).send({from: account});
      setStakeAmount(0);
      setStakModal(false)
      loadHandler();
    }catch { }
  }

  const unstakeBitxHandler = async () => {
    try{
      if(maxUnstake) {
        let amount = lpFarms.find(l => l.pid === selPid)?.detail.amount;
        await masterChefContract.methods.withdraw(selPid, amount).send({from: account});
      }else {
        await masterChefContract.methods.withdraw(selPid, Moralis.Units.ETH(unstakeAmount)).send({from: account});
      }
      setUnstakeAmount(0);
      setUnstakeModal(false);
    }catch { }
  }

  return (
    <section id="Section3">
      <div className="section_container">
        <div className="section_title">
          <div className="section_tab_control">
            <div className="stakeBox">
              <input type="checkbox" name="" id="stakedCheckbox" onChange={() => setIsOnlyStaked(!isOnlyStaked)}/>
              <label htmlFor="stakedCheckbox">Staked only</label>
            </div>
            <div className="tabBox">
              <button
                onClick={() => setTabActive(true)}
                className={tabActive ? 'active_btn': ''}
              >
                Active
              </button>
              <button
                onClick={() => setTabActive(false)}
                className={!tabActive ? 'active_btn': ''}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>
        <div className="section_body">
          <div className="section_body_title">
            <h4 className="title">LP token</h4>
          </div>
          <div className="section_body_content">
            {tabActive ? (
              <ul className="lp_token_list">
                {lpFarms?.map((v) => {
                  return (
                    <li key={v.pid}>
                      <div className="flex_list_box">
                        <div className="list_box">
                          <img
                            style={{ marginRight: "1rem" }}
                            src={v.logo}
                            alt=""
                          />
                          <div className="currency_content">
                            <strong className="currency">{v.lpSymbol}</strong>
                            <span className="rank">{v.multiplier}X</span>

                            <div className="app_content">
                              APR
                              <strong>
                                {v.apr/100}% <CalculatorsSvg/>
                              </strong>
                            </div>
                          </div>
                        </div>
                        <div className="list_box">
                          Earned
                          <strong>{formatPrice(v.earned)}</strong>
                        </div>
                        <div className="list_box">
                          APR
                          <strong>
                            {(v.apr/100).toFixed(3)}% <CalculatorsSvg/>
                          </strong>
                        </div>
                        <div className="list_box">
                          Liquidity
                          <strong>{`$${formatPrice(v.liquidity)}`}</strong>
                        </div>
                        <div className="list_box list_box_dropdown_details">
                          <button
                            className="btn_dropdown_details"
                            onClick={() => dropdownDetailsHandle(v.pid)}
                          >
                            <span>Details</span>
                            {isDropdownEnabled.includes(v.pid) ? (
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

                          {/* for dropdown view letter */}
                          {/* <ul className="dropdown_details_view"><li></li></ul> */}
                        </div>
                      </div>

                      {isDropdownEnabled.includes(v.pid) && (
                        <div className="dropdown_content_box">
                          <div className="content_box">
                            <ul>
                              <li className="sm_list">
                                Earned
                                <strong>{formatPrice(v.earned)}</strong>
                              </li>
                              <li className="sm_list">
                                Liquidity
                                <strong>{formatPrice(v.liquidity)}</strong>
                              </li>
                              <li>
                                <strong>
                                  Withdraw Fee 0%
                                </strong>
                              </li>
                              <li>
                                <a
                                  href={`https://pancakeswap.finance/add/BNB/${v.lpAddresses}`}
                                  className="content_link"
                                >
                                  Get {`${v.lpSymbol} `}
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
                                <a
                                  href={`https://bscscan.com/address/${v.lpAddresses}`}
                                  className="content_link"
                                >
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
                                  <span>{formatPrice(v.earned)}</span>
                                </li>
                                <li>
                                  <span>~${(formatPrice(v.earned)*busdPrice).toFixed(3)}</span>
                                </li>
                              </ul>
                              <button className="btn_harvest" onClick={() => harvestHandler(v.pid)} disabled={!(v.earned > 0)}>Harvest</button>
                            </div>
                          </div>
                          <div className="content_box">
                            <div className="card_box mx_0">
                              {
                                (!isAuthenticated || !approves.includes(v.pid)) &&
                                  <strong className="mb_sizer">
                                    Start Staking
                                  </strong>
                              }
                              {
                                isAuthenticated ?
                                  approves.includes(v.pid) ?
                                  (
                                    <>
                                      <button className="btn_connect_wallet mb-2" 
                                      disabled={!(v.balance > 0)}
                                      onClick={() => {
                                        setSelPid(v.pid)
                                        setStakModal(true)
                                      }} >Stake</button>
                                      <button className="btn_connect_wallet mt-3" 
                                      disabled={!(v.earned > 0)}
                                      onClick={() => {
                                        setSelPid(v.pid)
                                        setUnstakeModal(true)
                                      }} >UnStake</button>
                                    </>
                                  ) 
                                  :
                                  <button className="btn_connect_wallet" onClick={() => {
                                    enableBitxHandler(v.pid, v.lpAddresses);
                                  }}>Enable</button>
                                  :
                                  <button className="btn_connect_wallet" onClick={() => {
                                    dispatch(setWalletConnectAction(true));
                                  }}>Connect Wallet</button>
                              }
                            </div>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="lp_token_list">
                <li className="token_empty">No farms staked.</li>
              </ul>
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
                    setMaxStake(true)
                    setStakeAmount((lpFarms.find(l => l.pid === selPid)?.balance)/Math.pow(10, 18))
                  }}>Max</button>
                </div>
              </div>
              <button className="btn_connect_wallet" 
              disabled={(lpFarms.find(l => l.pid === selPid)?.balance)/Math.pow(10, 18) < stakeAmount}
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
                    setUnstakeAmount((lpFarms.find(l => l.pid === selPid)?.detail?.amount)/Math.pow(10, 18))
                  }}>Max</button>
                </div>
              </div>
              <button className="btn_connect_wallet" 
                onClick={() => unstakeBitxHandler()}
                disabled={(lpFarms.find(l => l.pid === selPid)?.detail.amount)/Math.pow(10, 18) < unstakeAmount}
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
                    setUnstakeAmount((lpFarms.find(l => l.pid === selPid)?.detail?.amount)/Math.pow(10, 18))
                  }}>Max</button>
                </div>
              </div>
              <button className="btn_connect_wallet" 
                onClick={() => unstakeBitxHandler()}
                disabled={(lpFarms.find(l => l.pid === selPid)?.detail.amount)/Math.pow(10, 18) < unstakeAmount}
              >Confirm</button>
            </div>
          </Modal.Body>
        </Modal>
        
    </section>
  );
}
