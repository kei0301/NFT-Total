import { CAKE_PER_YEAR, lpAprs } from "../config/constances"
import BigNumber from "bignumber.js"

export const getFarmApr = (
    poolWeight,
    busdPriceUsd,
    poolLiquidityUsd,
    farmAddress,
  )=> {
    const yearlyCakeRewardAllocation = poolWeight ? poolWeight * CAKE_PER_YEAR : new BigNumber(NaN)
    const cakeRewardsApr = yearlyCakeRewardAllocation* busdPriceUsd / poolLiquidityUsd * 100;
    let cakeRewardsAprAsNumber = null
    if (cakeRewardsApr !== null && cakeRewardsApr > 0) {
      cakeRewardsAprAsNumber = cakeRewardsApr;
    }
    const lpRewardsApr = lpAprs[farmAddress?.toLocaleLowerCase()] ?? 0
    return { cakeRewardsApr: cakeRewardsAprAsNumber, lpRewardsApr }
  }