import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Landing/Footer/Footer";

// styles
import styles from "./Privacy.module.css";

// icons
import shield from "./assets/shield.svg";
import lock from "./assets/lock.svg";
import tick from "./assets/tick.svg";
import rightside from "./assets/rightside.svg";

const Privacy = () => {
  const tableOfContents = [
    { id: "introduction", title: "Introduction" },
    { id: "information-collect", title: "Information We Collect" },
    { id: "how-we-use", title: "How We Use Your Information" },
    { id: "sharing", title: "Sharing of Information" },
    { id: "rights", title: "Your Rights and Choices" },
    { id: "retention", title: "Data Retention" },
    { id: "cookies", title: "Cookies and Tracking Technologies" },
    { id: "security", title: "Data Security" },
    { id: "transfers", title: "International Data Transfers" },
    { id: "children", title: "Children's Privacy" },
    { id: "third-party", title: "Third-Party Links" },
    { id: "changes", title: "Changes to This Policy" },
    { id: "contact", title: "Contact Us" },
  ];

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        {/* Header Section */}
        <div className={styles.headerContainer}>
          <div className={styles.headerContent}>
            <div className={styles.headerIcon}>
              <img src={shield?.src || shield} alt="privacy shield" />
            </div>
            <h1 className={styles.headerTitle}>
              <span className={styles.highlight}>Privacy</span> Policy
            </h1>
            <p className={styles.headerSubtitle}>Last Updated: 15 April 2025</p>
            <p className={styles.headerDescription}>
              Welcome to NexFellow! At NexFellow, we believe your privacy is
              fundamental. This Privacy Policy explains how we collect, use, and
              protect your personal information. Your trust is our priority.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContainer}>
          {/* Table of Contents */}
          <div className={styles.sidebar}>
            <div className={styles.tocContainer}>
              <h3 className={styles.tocTitle}>Table of Contents</h3>
              <nav className={styles.tocNav}>
                {tableOfContents.map((item, index) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={styles.tocLink}
                  >
                    <span className={styles.tocNumber}>{index + 1}.</span>
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <div className={styles.actionCard}>
                <img src={lock?.src || lock} alt="security" />
                <div className={styles.actionInfo}>
                  <p className={styles.actionText}>Your data is secure</p>
                  <p className={styles.actionSubtext}>End-to-end encryption</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className={styles.content}>
            {/* Section 1: Introduction */}
            <section id="introduction" className={styles.section}>
              <h2 className={styles.sectionTitle}>1. Introduction</h2>
              <div className={styles.sectionContent}>
                <p>
                  Welcome to NexFellow (&quot;NexFellow&quot;, &quot;we&quot; or
                  &quot;us&quot;)! Our Privacy Policy governs your use of our
                  Service (your visit to https://nexfellow.com/) and explains
                  how we collect, safeguard, and disclose information that
                  results from your use of our web pages. Your agreement with us
                  includes this Privacy Policy, Terms &amp; Conditions
                  (&quot;Agreements&quot;). You acknowledge that you have read
                  and understood Agreements and agree to be bound by them.
                </p>
                <p>
                  If you do not agree with (or cannot comply with) Agreements,
                  then you may not use the Service, but please let us know by
                  emailing to community@nexfellow.com so we can try to find a
                  solution. These policies apply to all visitors, users, and
                  others who wish to access or use the Service. Thank you for
                  being responsible.
                </p>
              </div>
            </section>

            {/* Section 2: Information We Collect */}
            <section id="information-collect" className={styles.section}>
              <h2 className={styles.sectionTitle}>2. Information We Collect</h2>
              <div className={styles.sectionContent}>
                <p>
                  At NexFellow, we are committed to transparency about the
                  information we collect. This section outlines the types of
                  information we collect and how we use it.
                </p>

                <h3 className={styles.subsectionTitle}>
                  2.1. Information You Provide to Us
                </h3>
                <div className={styles.listContainer}>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Registration Information:</strong> When you create
                      an account, we collect your name, email address, and
                      password.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Profile Information:</strong> You may choose to
                      provide additional information to enhance your profile,
                      such as your bio, location, professional experience,
                      skills, or expertise.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Content:</strong> We collect information you post,
                      share, or upload on the platform, including text, images,
                      videos, and files.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Community and Project Information:</strong> We
                      collect information about the communities you join and
                      projects you create, including community names,
                      descriptions, and member roles.
                    </div>
                  </div>
                </div>

                <h3 className={styles.subsectionTitle}>
                  2.2. Information We Collect Automatically
                </h3>
                <div className={styles.listContainer}>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Usage Data:</strong> We collect information about
                      how you interact with the platform, such as pages visited,
                      features used, and actions taken.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Device Information:</strong> We collect data about
                      the device you use to access NexFellow, including device
                      type, operating system, browser type, IP address, and
                      device identifiers.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Cookies and Tracking:</strong> We use cookies and
                      similar technologies to track your activity on the
                      platform, enhance your experience, and analyse platform
                      performance.
                    </div>
                  </div>
                </div>

                <div className={styles.highlightBox}>
                  <h4 className={styles.highlightTitle}>Your Choices</h4>
                  <p>
                    You have choices about the information we collect and how it
                    is used. You can:
                  </p>
                  <ol className={styles.numberedList}>
                    <li>Update or correct your profile information</li>
                    <li>
                      Control who can see your content and profile information
                    </li>
                    <li>Opt-out of certain data collection and use</li>
                    <li>Delete your account and associated information</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Section 3: How We Use Your Information */}
            <section id="how-we-use" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                3. How We Use Your Information
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  We use the information we collect to provide, improve, and
                  secure our services. Here&apos;s a detailed breakdown of how
                  we use your information:
                </p>

                <h3 className={styles.subsectionTitle}>
                  3.1. To Provide Our Services
                </h3>
                <div className={styles.listContainer}>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Account Management:</strong> We use your
                      registration information to create and manage your
                      account.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Community Management:</strong> We use your
                      information to facilitate community management, including
                      member roles and permissions.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Content Sharing:</strong> We use your content to
                      enable sharing and collaboration within communities and
                      projects.
                    </div>
                  </div>
                </div>

                <h3 className={styles.subsectionTitle}>
                  3.2. To Improve Our Services
                </h3>
                <div className={styles.listContainer}>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Analytics and Insights:</strong> We use usage data
                      and analytics to understand how users interact with the
                      platform and identify areas for improvement.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Feature Development:</strong> We use user feedback
                      and behavior to inform feature development and prioritize
                      new features.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Platform Optimization:</strong> We use device
                      information and usage data to optimize platform
                      performance and ensure compatibility.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Sharing of Information */}
            <section id="sharing" className={styles.section}>
              <h2 className={styles.sectionTitle}>4. Sharing of Information</h2>
              <div className={styles.sectionContent}>
                <p>
                  We may share your information with third parties under the
                  following circumstances:
                </p>

                <div className={styles.cardContainer}>
                  <div className={styles.infoCard}>
                    <h4>Service Providers</h4>
                    <p>
                      We engage trusted third-party service providers to perform
                      functions and provide services to us (such as hosting,
                      analytics, customer support, and email delivery).
                    </p>
                  </div>
                  <div className={styles.infoCard}>
                    <h4>Legal Requirements</h4>
                    <p>
                      We may disclose your information if required to do so by
                      law or in response to valid requests by public
                      authorities.
                    </p>
                  </div>
                  <div className={styles.infoCard}>
                    <h4>With Your Consent</h4>
                    <p>
                      We may share your information for any other purpose
                      disclosed to you at the time we collect the information or
                      with your consent.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Your Rights and Choices */}
            <section id="rights" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                5. Your Rights and Choices
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  You have the following rights regarding your personal data:
                </p>
                <div className={styles.listContainer}>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Access and Update:</strong> You can access and
                      update your personal profile information directly through
                      your NexFellow account settings.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Delete Your Data:</strong> You may request the
                      deletion of your account and associated personal
                      information by contacting us.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Withdraw Consent:</strong> Where processing is
                      based on consent, you may withdraw your consent at any
                      time without affecting the lawfulness of processing based
                      on consent before its withdrawal.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick?.src || tick} alt="tick" />
                    <div>
                      <strong>Opt-Out of Communications:</strong> You can opt
                      out of marketing and promotional emails by using the
                      unsubscribe link in our emails.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Data Security */}
            <section id="security" className={styles.section}>
              <h2 className={styles.sectionTitle}>8. Data Security</h2>
              <div className={styles.sectionContent}>
                <p>
                  We use encryption (HTTPS/TLS) to protect data transmitted to
                  and from our site. However, no data transmission over the
                  Internet is 100% secure, so we can&apos;t guarantee security.
                  You use the Service at your own risk, and you&apos;re
                  responsible for taking reasonable measures to secure your
                  account.
                </p>
              </div>
            </section>

            {/* Section 7: Children's Privacy */}
            <section id="children" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                10. Children&apos;s Privacy
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  NexFellow is not intended for use by children under the age of
                  13 (or equivalent minimum age in the relevant jurisdiction).
                  We do not knowingly collect personal information from
                  children. If we become aware that we have collected personal
                  data from a child without verification of parental consent, we
                  will take steps to delete such data promptly.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className={styles.section}>
              <h2 className={styles.sectionTitle}>13. Contact Us</h2>
              <div className={styles.sectionContent}>
                <p>
                  If you have any questions or concerns about this Privacy
                  Policy or our data practices, please contact us at:
                </p>

                <div className={styles.contactContainer}>
                  <div className={styles.contactCard}>
                    <div className={styles.contactInfo}>
                      <p className={styles.contactLabel}>
                        NexFellow Privacy Team
                      </p>
                      <p className={styles.contactValue}>
                        📧 Email: community@nexfellow.com
                      </p>
                      <p className={styles.contactValue}>
                        🌐 Website: https://nexfellow.com/
                      </p>
                    </div>
                    <div className={styles.contactIcon}>
                      <img src={rightside?.src || rightside} alt="contact" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Back to Top */}
            <div className={styles.backToTop}>
              <a href="#top" className={styles.backToTopLink}>
                Back to Top
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Privacy;
