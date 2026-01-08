import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import Style from "./card.module.css"
const Card = ({ count,text }) => {
  return (
    <div className={Style.card}>
      <div className={Style.firstDiv}>
        <h4>{count} </h4>
        <h3>{text} </h3>
      </div>
      <div className={Style.secondDiv}>
        <FontAwesomeIcon icon={faUserPlus} />
      </div>
    </div>
  );
};

export default Card; 
