import { useState } from "react";
import api from "../../lib/axios";
import { toast } from "sonner";

import Navbar from "../../components/Navbar/Navbar";
//styles
import styles from "./Contact.module.css";

//icons
// import WEB from "./assets/Web.svg"
import send from "./assets/send1.svg";
import tick from "./assets/tick.svg";
import rightside from "./assets/rightside.svg";
import Footer from "../../components/Landing/Footer/Footer";

const Contact = () => {
  const [formdata, setFormdata] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormdata({
      ...formdata,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/user/contact", formdata);

      if (response.status === 200) {
        toast.success("Thank you for contacting us");
        setFormdata({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          subject: "",
          message: "",
        });
      }
    } catch (error) {
      toast.error(error.response.data || "Something went wrong");
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.mainContainer}>
          <div className={styles.leftside}>
            <div className={styles.topContainer}>
              {/* <div className={styles.icon}>
                    <img src={WEB} alt="web" />
                </div> */}
              <h1 className={styles.title}>
                <div className={styles.highlight}>Connect</div> with Us Today!
              </h1>
              <p className={styles.subtitle}>
                Have a question or interested in partnering with NexFellow?
                Reach out to us for any queries, partnerships opportunities, or
                collaboration ideas. we are here to help and excited to connect
                with you!
              </p>
            </div>

            <div className={styles.middleContainer}>
              <div className={styles.heading}>Our Commitment to You</div>

              <div className={styles.commitments}>
                <div className={styles.commitmentText}>
                  <img src={tick?.src || tick} alt="tick" />
                  <p>Swift responses, dedicated support</p>
                </div>

                <div className={styles.commitmentText}>
                  <img src={tick?.src || tick} alt="tick" />
                  <p>Efficient and always here for you</p>
                </div>

                <div className={styles.commitmentText}>
                  <img src={tick?.src || tick} alt="tick" />
                  <p>We listen, understand, and act promptly</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.rightside}>
            <div className={styles.formContainer}>
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formPart}>
                  <div className={styles.inputContainer}>
                    <label className={styles.inputContainerLabel}>
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formdata.firstName}
                      onChange={handleChange}
                      placeholder="Enter First Name"
                      className={styles.inputContainerInput}
                      required
                    />
                  </div>

                  <div className={styles.inputContainer}>
                    <label className={styles.inputContainerLabel}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formdata.lastName}
                      onChange={handleChange}
                      placeholder="Enter Last Name"
                      className={styles.inputContainerInput}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formPart}>
                  <div className={styles.inputContainer}>
                    <label className={styles.inputContainerLabel}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formdata.email}
                      onChange={handleChange}
                      placeholder="Enter Email"
                      className={styles.inputContainerInput}
                      required
                    />
                  </div>

                  <div className={styles.inputContainer}>
                    <label className={styles.inputContainerLabel}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formdata.phoneNumber}
                      onChange={handleChange}
                      placeholder="Enter Phone Number"
                      className={styles.inputContainerInput}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formPart}>
                  <div className={styles.inputContainer}>
                    <label className={styles.inputContainerLabel}>
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formdata.subject}
                      onChange={handleChange}
                      placeholder="Enter Subject"
                      className={styles.inputContainerInput}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formPart}>
                  <div className={styles.inputContainer}>
                    <label className={styles.inputContainerLabel}>
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formdata.message}
                      onChange={handleChange}
                      placeholder="Enter Your Message here..."
                      className={styles.inputContainerTextarea}
                      required
                    />
                  </div>
                </div>

                <div className={styles.buttonContainer}>
                  <button type="submit" className={styles.button}>
                    <img src={send?.src || send} alt="send" />
                    Send Your Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className={styles.mainContainer}>
          <div className={styles.leftside}>
            <div className={styles.bottomContainer}>
              <div className={styles.info}>
                <p className={styles.text}>You can email us here</p>
                <p className={styles.email}>community@nexfellow.com</p>
              </div>

              <div className={styles.rightIcon}>
                <img src={rightside?.src || rightside} alt="rightside" />
              </div>
            </div>
          </div>

          <div className={styles.rightside}>
            <div className={styles.bottomContainer}>
              <div className={styles.info}>
                <p className={styles.text}>Office Hours</p>
                <p className={styles.email}>09:00 AM - 06:00 PM</p>
              </div>

              <div className={styles.rightIcon}>
                <img src={rightside?.src || rightside} alt="rightside" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
