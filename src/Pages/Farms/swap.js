
import React, { Component } from 'react'

import { ArkenWidget } from 'arken-widget'




class Swap extends Component {
  render() {
    return (
      <ArkenWidget
        chain='bsc'
        mode="light"
        themeColor="#e09819"
        themeTextColor="#efce88"
       baseTokenAddress="0xbb622ceba240980b3d6a200108e1753bc928adb3"
        quoteTokenAddress="0xbb622ceba240980b3d6a200108e1753bc928adb3"
        externalTopTokenAddress={[]}
        customImageToken={{}}
        graphRange={7}
        widgetType="graph-swap"
        containerStyle={{
          width: "100%",
          minHeight: 700
          // put container style here
        }}
      />
    )
  }
}




export default Swap;