export const MasterChefAddr = "0x377E420B7d6aBABA10344601c023c4b3b2381d60";

export const MeatVaultAddr = "0x7cE6a9741eeDB7a492c6329Af011014A87762cdb";

export const BitxAddr = "0xBb622cEba240980B3D6A200108e1753bc928ADb3";

export const UsdtBitxLpAddr = "0x3024b37aC5499F0e15A19849Cdf130A8E60BDD9b";

export const BusdBitxLpAddr = "0x6e7E318067cB9b814A2F88E04559E1b0ada5d24A";

export const BitxbusdLpAddr = "0xaF7470E99bA6F624DF58C4ebeCdAaA9922376Ca1";

// export const MulticallAddr = "0x6e5BB1a5Ad6F68A8D7D6A5e47750eC15773d6042"; //testnet
export const MulticallAddr = "0x41263cba59eb80dc200f3e2544eda4ed6a90e76c";

export const BUSDAddr = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";

export const USDTAddr = "0x55d398326f99059fF775485246999027B3197955";

export const ETHAddr = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";

export const CAKE_PER_YEAR = 12614;

export const TotalAllocPoint = 1500;

export const lpAprs = {
    [UsdtBitxLpAddr]: 5,
    [BusdBitxLpAddr]: 5,
    [BitxbusdLpAddr]: 5,
    [BitxbusdLpAddr]: 5,
    
}

export const Farms = [
    {
        pid: 1,
        lpSymbol: 'BITX-USDT LP',
        logo: "./img/t.png",
        lpAddresses: "0x3024b37aC5499F0e15A19849Cdf130A8E60BDD9b",
        token: "0xBb622cEba240980B3D6A200108e1753bc928ADb3",
        quoteToken: "0x55d398326f99059fF775485246999027B3197955",
    },
    {
        pid: 2,
        lpSymbol: 'BUSD-BITX LP',
        logo: "./img/d.png",
        lpAddresses: "0x6e7E318067cB9b814A2F88E04559E1b0ada5d24A",
        token: "0x6e7E318067cB9b814A2F88E04559E1b0ada5d24A",
        quoteToken: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    },
    //{
       // pid: 3,
     //   lpSymbol: 'BNB-BITX LP',
      //  logo: "./img/d.png",
       // lpAddresses: "0xaF7470E99bA6F624DF58C4ebeCdAaA9922376Ca1",
       // token: "0x55d398326f99059fF775485246999027B3197955",
       // quoteToken: "0xBb622cEba240980B3D6A200108e1753bc928ADb3",
    //},
    {
        pid: 3,
        lpSymbol: 'USDT-USDT',
        logo: "./img/t.png",
        lpAddresses: "0x3024b37aC5499F0e15A19849Cdf130A8E60BDD9b",
        token: "0xBb622cEba240980B3D6A200108e1753bc928ADb3",
        quoteToken: "0x55d398326f99059fF775485246999027B3197955",
    },
    {
        pid: 3,
        lpSymbol: 'BITX-BITX',
        logo: "./img/t.png",
        lpAddresses: "0x3024b37aC5499F0e15A19849Cdf130A8E60BDD9b",
        token: "0xBb622cEba240980B3D6A200108e1753bc928ADb3",
        quoteToken: "0x55d398326f99059fF775485246999027B3197955",
    },
    {
        pid: 3,
        lpSymbol: 'BUSD-BUSD',
        logo: "./img/t.png",
        lpAddresses: "0x3024b37aC5499F0e15A19849Cdf130A8E60BDD9b",
        token: "0xBb622cEba240980B3D6A200108e1753bc928ADb3",
        quoteToken: "0x55d398326f99059fF775485246999027B3197955",
    }
]

