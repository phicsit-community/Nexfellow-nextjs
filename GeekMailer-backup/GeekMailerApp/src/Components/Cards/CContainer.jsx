import React from "react";
import Style from "./CContainer.module.css";
// import styled from "styled-components";
import Card from "./Card";
const CardContainer = ({ children, head }) => {
  return (
    <div className={Style.CardContainer}>
      <h1 className={Style.ccHead}>Hello</h1>
      {children}
    </div>
  );
};

export default CardContainer;
