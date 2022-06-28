import React from "react";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

import "./Base.css";
function Base(props) {
  return (
    <div id="Base">
      <div className="Base_design_wrapper">
        <div className="design_left">
          <img src={"./img/3d_illustration.png"} alt="" />
        </div>
        <div className="design_head">
          <img src={"./img/head.png"} alt="img" />
        </div>
        <div className="floating_btn_design">
          <button className="floating_btn">
            <img
              src={"./img/need_help.png"}
              alt="need_help.png"
            />
          </button>
        </div>

        <div className="footer_fixed_content">
          <strong>CHR $24.19</strong>
          <strong>
            <svg
              width={13}
              height={13}
              viewBox="0 0 13 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="8.5" cy="4.5" r="4.5" fill="#34D399" />
              <path
                d="M7.5 11.5C3.91015 11.5 1 8.58985 1 5"
                stroke="#34D399"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>{" "}
            192977089
          </strong>
        </div>
      </div>

      <Header></Header>
      {props.children}
      <Footer></Footer>
    </div>
  );
}

export default Base;
