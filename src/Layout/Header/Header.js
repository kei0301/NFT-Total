import React, { useState, useEffect } from "react";
import { useMoralis, useTokenPrice, useERC20Balances } from "react-moralis";
import { Modal } from "rsuite"
import { useSelector, useDispatch } from "react-redux"
import { shapeAddress } from "../../utils/formatHelpers"
import { setbusdPriceAction, setWalletConnectAction } from "../../store/actions/GlobalActions";
import Web3 from "web3"

import Bep20 from "../../backend/abis/BEP20.json";
import MasterChef from "../../backend/abis/MasterChef.json";
import MeatVault from "../../backend/abis/LockBitx.json";
import Multicall from "../../backend/abis/Multicall.json";

import { BitxAddr, MasterChefAddr, MeatVaultAddr, MulticallAddr, BUSDAddr, USDTAddr, ETHAddr } from "../../config/constances";

import { setBitxContractAction, setMasterChefContractAction, setMeatContractAction, setMeatVaultContractAction, setMulticallAction, setWeb3Action } from "../../store/actions/WalletActions";
import "./Header.css";

const connectors = [
  {
    title: "Metamask",
    icon: "./img/metamaskWallet.png",
    connectorId: "injected",
    priority: 1,
  },
  {
    title: "WalletConnect",
    icon: "./img/WalletConnect.png",
    connectorId: "walletconnect",
    priority: 2,
  },
  {
    title: "Trust Wallet",
    icon: "./img/TrustWallet.png",
    connectorId: "injected",
    priority: 3,
  },
  {
    title: "MathWallet",
    icon: "./img/MathWallet.png",
    connectorId: "injected",
    priority: 999,
  },
  {
    title: "TokenPocket",
    icon: "./img/TokenPocket.png",
    connectorId: "injected",
    priority: 999,
  },
  {
    title: "SafePal",
    icon: "./img/SafePal.png",
    connectorId: "injected",
    priority: 999,
  },
  {
    title: "Coin98",
    icon: "./img/Coin98.png",
    connectorId: "injected",
    priority: 999,
  },
];

function Header() {

  const { authenticate, isAuthenticated, account, logout, enableWeb3, isWeb3Enabled, isWeb3EnableLoading, web3 } = useMoralis();
  const dispatch = useDispatch();
  const { data: busdPrice } = useTokenPrice({chain: "bsc", address: BUSDAddr.toLowerCase()})
  const { data: usdtPrice } = useTokenPrice({chain: "bsc", address: USDTAddr.toLowerCase()})
  const { data: ethPrice } = useTokenPrice({chain: "bsc", address: ETHAddr.toLowerCase()})
  const { data: assets } = useERC20Balances();

  const [ balances, setBalances ] = useState({usdt: 0, eth: 0, busd: 0});
  const [ prices, setPrices ] = useState({usdt: 0, eth: 0, busd: 0});

  const isWalletConnect = useSelector(state => state.global.isWalletConnect);
  
  const nav_list_menu = [
    {
      id: 1,
      name: "Dapp",
      link: "https://www.bitconnext.io/",
      classList: "active_link",
    },
    {
      id: 2,
      name: "Swap",
      link: "/swap",
      classList: "",
    },
    {
      id: 3,
      name: "Staking",
      link: "https://steakstake.io",
      classList: "",
    },
    {
      id: 4,
      name: "Disclamer",
      link: "/Disclamer",
      classList: "",
    },
    {
      id: 5,
      name: "Policy",
      link: "/policy",
      classList: "",
    },
  ];

  const nav_list_user = [
    {
      id: 1,
      amount: "$0.0055",
      action: "#",
      icon: "./img/icons/icon1.png",
      symbol: "usdt"
    },
    {
      id: 2,
      amount: "$0.0055",
      action: "#",
      icon: "./img/icons/icon2.png",
      symbol: "busd"
    },
    {
      id: 3,
      amount: "$0.0004",
      action: "#",
      icon: "./img/icons/icon3.png",
      symbol: "eth"
    },
  ];

  const [scrollClass, setScrollClass] = useState("");
  window.addEventListener("scroll", (e) => {
    if (
      document.body.scrollTop > 60 ||
      document.documentElement.scrollTop > 60
    ) {
      setScrollClass("HeaderScrollActive");
    } else {
      setScrollClass("");
    }
  });

  useEffect(() => {
    let busd = assets?.find(a => a.token_address === BUSDAddr.toLocaleLowerCase());
    let usdt = assets?.find(a => a.token_address === USDTAddr.toLocaleLowerCase());
    let eth = assets?.find(a => a.token_address === ETHAddr.toLocaleLowerCase());
    console.log(usdt)
    if(typeof busd !== "undefined" && busd?.balance !== null) {
      setBalances({...balances, busd: (busd.balance/Math.pow(10, 18)).toFixed(3)})
    }

    if(typeof eth !== "undefined" && eth?.balance !== null) {
      setBalances({...balances, eth: (eth.balance/Math.pow(10, 18)).toFixed(3)})
    }

    if(typeof usdt !== "undefined" && usdt?.balance !== null) {
      setBalances({...balances, usdt: (usdt.balance/Math.pow(10, 18)).toFixed(3)})
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets])

  useEffect(() => {
    if(busdPrice) {
      dispatch(setbusdPriceAction(busdPrice?.usdPrice))
      setPrices({...prices, busd: busdPrice?.usdPrice});
    }

    if(usdtPrice) {
      setPrices({...prices, usdt: usdtPrice?.usdPrice});
    }

    if(ethPrice) {
      setPrices({...prices, eth: ethPrice?.usdPrice});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busdPrice, usdtPrice, ethPrice])

  useEffect(() => {

    const connectorId = window.localStorage.getItem("connectorId");
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading) enableWeb3({ provider: connectorId });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isWeb3Enabled]);

  const [navToggle, setNavToggle] = useState(false);

  window.addEventListener("click", (event) => {
    let HeaderAside = document.querySelector("#HeaderAside");
    // console.log(event.target == HeaderAside)
    if (event.target === HeaderAside) {
      setNavToggle(false);
    }
  });

  useEffect(() => {

		(async () => {

      // let web3Ins = new Web3(web3?.provider || "https://data-seed-prebsc-1-s1.binance.org:8545/");
      let web3Ins = new Web3(web3?.provider || "https://bsc-dataseed1.ninicoin.io");
      
      dispatch(setWeb3Action(web3Ins))
      const multi = new web3Ins.eth.Contract(Multicall, MulticallAddr)
      
      dispatch(setMulticallAction(multi));

      let bitx = new web3Ins.eth.Contract(Bep20.abi, BitxAddr);
      dispatch(setBitxContractAction(bitx));

      let meat = new web3Ins.eth.Contract(Bep20.abi, BUSDAddr);
      dispatch(setMeatContractAction(meat));

      let masterChef = new web3Ins.eth.Contract(MasterChef.abi, MasterChefAddr);
      dispatch(setMasterChefContractAction(masterChef));

      let vault = new web3Ins.eth.Contract(MeatVault.abi, MeatVaultAddr);
      dispatch(setMeatVaultContractAction(vault));
			
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWeb3Enabled, isAuthenticated])

  return (
    <header
      id="Header"
      className={`${scrollClass} ${navToggle ? "toggleActiveHeader" : ""}`}
    >
      <div className="header_container">
        <nav id="header_nav">
          <button
            className="nav_toggle_btn"
            onClick={() => setNavToggle(!navToggle)}
          >
            {navToggle ? (
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth={0}
                viewBox="0 0 512 512"
                className="hidden mr-6 text-4xl cursor-pointer lg:block"
                height="2.3rem"
                width="2.3rem"
                xmlns="http://www.w3.org/2000/svg"
                style={{ zIndex: 99 }}
              >
                <path
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={32}
                  d="M368 368L144 144m224 0L144 368"
                />
              </svg>
            ) : (
              <svg
                stroke="currentColor"
                fill="#fff"
                strokeWidth={0}
                viewBox="0 0 512 512"
                className="hidden mr-6 text-4xl cursor-pointer lg:block"
                height="2.3rem"
                width="2.3rem"
                xmlns="http://www.w3.org/2000/svg"
                style={{ zIndex: 99 }}
              >
                <path
                  fill="#fff"
                  strokeLinecap="round"
                  strokeMiterlimit={10}
                  strokeWidth={48}
                  d="M88 152h336M88 256h336M88 360h336"
                />
              </svg>
            )}
          </button>
          <a href="#" className="logo_link">
            <img src={"./img/logo.png"} alt="logo" />
          </a>
          <ul className="nav_list_menu">
            {nav_list_menu.map((v) => {
              return (
                <li key={v.id}>
                  <a href={v.link} className={v.classList}>
                    {v.name}
                  </a>
                </li>
              );
            })}
          </ul>

          <ul className="nav_list_user">
            {nav_list_user.map((v) => {
              return (
                <li key={v.id}>
                  <button className="nav_light_btn">
                    <img src={v.icon} alt="icon" /> { (balances[v.symbol] * prices[v.symbol])?.toFixed(3) }
                  </button>
                </li>
              );
            })}

            <li>
              {
                isAuthenticated ?
                  <button className="connect_btn" onClick={() => logout()}> { shapeAddress(account) } </button>
                  :
                  <button className="connect_btn" onClick={() => dispatch(setWalletConnectAction(true))}>Connect Wallet</button>
              }

              <Modal open={isWalletConnect} onClose={() => dispatch(setWalletConnectAction(false))}  style={{marginTop: "100px"}}>
                <Modal.Body>
                  <div className="container row">
                    {
                      connectors.map((c, idx) => (
                        <div className="text-center col-6" key={idx}>
                          <div className="rounded m-3 cursor_hand" to="#" onClick={async () => {
                              try {
                                await authenticate({ provider: c.connectorId });
                                window.localStorage.setItem("connectorId", c.connectorId);
                                dispatch(setWalletConnectAction(false));
                              } catch (e) {
                                dispatch(setWalletConnectAction(false));
                                console.error(e);
                              }
                            }}>
                            <img className="mb-3 rounded" src={c.icon} alt={c.title} style={{alignSelf: "center", fill: "rgb(40, 13, 95)", flexShrink: "0", marginBottom: "8px", height: "40px"}}/>
                            <h5 className="mb-0">
                              {c.title}
                            </h5>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </Modal.Body>
              </Modal>

            </li>
          </ul>
        </nav>
      </div>
      <HeaderAside
        navToggle={navToggle}
        nav_list_menu={nav_list_menu}
        nav_list_user={nav_list_user}
      ></HeaderAside>
     
    </header>
  );
}

export default Header;

const HeaderAside = ({ navToggle, nav_list_menu, nav_list_user }) => {
  return (
    <aside id="HeaderAside" className={navToggle ? "HeaderAsideActive" : ""}>
      <div className={`aside_box_wrapper ${navToggle ? "aside_active" : ""}`}>
        <ul className="nav_list_menu">
          {nav_list_menu.map((v) => {
            return (
              <li key={v.id}>
                <a href={v.link} className={v.classList}>
                  {v.name}
                </a>
              </li>
            );
          })}
        </ul>
        <div className="aside_nav_content">
          <ul className="nav_list_user_box">
            {nav_list_user.map((v) => {
              return (
                <li key={v.id}>
                  <button className="nav_light_btn">
                    <img src={v.icon} alt="icon" /> {v.amount}
                  </button>
                </li>
              );
            })}
          </ul>
          <strong>Total Value Locked</strong>
          <strong>$2,649.86</strong>
        </div>
      </div>
    </aside>
  );
};
