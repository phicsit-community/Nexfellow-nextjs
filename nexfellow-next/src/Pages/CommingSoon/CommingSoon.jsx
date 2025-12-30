import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './Comingsoon.module.css';

const Comingsoon = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/feed');
    };

    return (
        <div className={styles.comingsoon}>
            <div className={styles.content}>
                <h1>We are Coming Soon!</h1>
                <p>
                    We’re working hard to launch this page.
                    <br /> This page is currently under construction.
                </p>
                {/* <button className={styles.comingNotifyButton}>Notify Me</button>
                <button className={styles.comingNotifyButton} onClick={handleClick}>
                    Get back to Home
                </button> */}
                {/* <div className={styles.socialIcons}>
                    <a
                        href="https://www.facebook.com/PHICSIT"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialIcon}
                    >
                        <FaFacebookF />
                    </a>
                    <a
                        href="https://x.com/phicsit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialIcon}
                    >
                        <FaTwitter />
                    </a>
                    <a
                        href="https://www.instagram.com/phicsit.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialIcon}
                    >
                        <FaInstagram />
                    </a>
                    <a
                        href="https://www.linkedin.com/company/phicsit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialIcon}
                    >
                        <FaLinkedinIn />
                    </a>
                </div> */}
            </div>
        </div>
    );
};

export default Comingsoon;
