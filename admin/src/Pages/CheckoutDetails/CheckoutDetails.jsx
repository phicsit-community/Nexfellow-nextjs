import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag, faTimes } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../Components/Navbar/Navbar";
import "./CheckoutDetails.css";

const CheckoutDetails = () => {
  const handleClose = () => {
    console.log("Close the page");
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="content">
          <div className="upper">
            <h2>Checkpoint Details</h2>
            <div className="close-icon" onClick={handleClose}>
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </div>

          <div className="lower">
            <div className="left-section">
              <form className="form">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" placeholder="Enter title" />

                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Enter description"
                ></textarea>

                <div className="button-container">
                  <button type="button" className="cancel-button">
                    Cancel
                  </button>
                  <button type="submit" className="save-button">
                    Save
                  </button>
                </div>
              </form>
            </div>

            <div className="right-section">
              <h3>10 Checkpoints</h3>
              <div className="checkpoint-list">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="checkpoint">
                    <div className="flag-icon">
                      <FontAwesomeIcon icon={faFlag} />
                    </div>
                    <div className="checkpoint-text">
                      <strong>DAY 1</strong>
                      <br />
                      DATE MONTH, TIME - TIME
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutDetails;
