import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faTimes, faUpload ,faCopy} from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faXTwitter, faLinkedin, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import "./ShareChallenge.css";

const ShareChallenge = () => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://geekclash.in/");
    alert("Link copied to clipboard!");
  };

  return (
    <div className="share-challenge-container">
      <div className="share-challenge">
        <div className="header">
          <h2>Share Challenge</h2>
          <div className="close-icon">
            <FontAwesomeIcon icon={faTimes} />
          </div>
        </div>

        <div className="challenge-details">
          <div className="challenge-image">
            {/* Image here */}
          </div>
          <div className="challenge-info">
            {/* <h3>Challenge Name</h3> */}
            <p className="cName">Challenge Name</p>
            <p>20 September - 30 September</p>
            <p className="free">Free</p>
          </div>
        </div>

        <div className="share-buttons">
          <a
            href=""
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faUpload} />
          </a>

          <a
            href="https://twitter.com/intent/tweet?url=https://geekclash.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faXTwitter} />
          </a>
          <a
            href="https://www.linkedin.com/sharing/share-offsite/?url=https://geekclash.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
          <a
            href="https://api.whatsapp.com/send?text=https://geekclash.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
          </a>

          <a
            href="https://www.facebook.com/sharer/sharer.php?u=https://geekclash.in/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faFacebook} />
          </a>
        </div>

        <div className="link-section">
          <h4>Challenge page link</h4>
          <div className="link-box">
            <input type="text" value="https://geekclash.in/" readOnly />
            <button className="copy-button" onClick={handleCopyLink}>
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareChallenge;
