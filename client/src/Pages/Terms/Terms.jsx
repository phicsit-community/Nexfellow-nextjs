import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Landing/Footer/Footer";

// styles
import styles from "./Terms.module.css";

// icons
import document from "./assets/document.svg";
import lock from "./assets/lock.svg";
import tick from "./assets/tick.svg";

const Terms = () => {
  const [showFloatingToc, setShowFloatingToc] = useState(false);
  const tableOfContents = [
    { id: "eligibility", title: "Eligibility" },
    { id: "account-registration", title: "Account Registration and Security" },
    { id: "user-conduct", title: "User Conduct and Responsibilities" },
    { id: "content-ownership", title: "Content Ownership and Licensing" },
    { id: "community-events", title: "Community and Events" },
    { id: "privacy", title: "Privacy" },
    { id: "payments-fees", title: "Payments and Fees" },
    { id: "third-party", title: "Third-Party Links and Services" },
    { id: "termination", title: "Termination of Use" },
    { id: "disclaimers", title: "Disclaimers and Limitation of Liability" },
    { id: "indemnification", title: "Indemnification" },
    { id: "modifications", title: "Modifications to These Terms" },
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
              <img src={document} alt="terms document" />
            </div>
            <h1 className={styles.headerTitle}>
              <span className={styles.highlight}>Terms</span> of Service
            </h1>
            <p className={styles.headerSubtitle}>Last Updated: 15 April 2025</p>
            <p className={styles.headerDescription}>
              Welcome to NexFellow! These Terms of Service (&quot;Terms&quot;)
              govern your access to and use of the NexFellow website,
              applications, and all related services (collectively, the
              &quot;Platform&quot;). By accessing or using NexFellow, you agree
              to comply with and be bound by these Terms. Please read these
              Terms carefully before using our Platform. If you do not agree
              with any part of these Terms, you must not use NexFellow.
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
                <img src={lock} alt="security" />
                <div className={styles.actionInfo}>
                  <p className={styles.actionText}>Your agreement is secure</p>
                  <p className={styles.actionSubtext}>Legally binding terms</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className={styles.content}>
            {/* Section 1: Eligibility */}
            <section id="eligibility" className={styles.section}>
              <h2 className={styles.sectionTitle}>1. Eligibility</h2>
              <div className={styles.sectionContent}>
                <p>
                  To use NexFellow, you must be at least 13 years old. If you
                  are under 18, you must have permission from a parent or legal
                  guardian. By using the Platform, you represent and warrant
                  that you meet all eligibility requirements. If you are using
                  the Platform on behalf of a company or other legal entity, you
                  represent and warrant that you are authorized to bind that
                  entity to these Terms.
                </p>
              </div>
            </section>

            {/* Section 2: Account Registration and Security */}
            <section id="account-registration" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                2. Account Registration and Security
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  When creating an account on NexFellow, you agree to provide
                  accurate information including your full name, username, a
                  valid email address, and profile details. You are responsible
                  for maintaining the confidentiality of your account and
                  password, and for all activities that occur under your
                  account. NexFellow is not liable for any loss or damage
                  resulting from your failure to maintain account security.
                </p>
              </div>
            </section>

            {/* Section 3: User Conduct and Responsibilities */}
            <section id="user-conduct" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                3. User Conduct and Responsibilities
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  You agree to use NexFellow in accordance with all applicable
                  laws and in a respectful and constructive manner. You must
                  not:
                </p>
                <div className={styles.listContainer}>
                  <div className={styles.listItem}>
                    <img src={tick} alt="tick" />
                    <div>
                      <strong>Post or share content</strong> that is abusive,
                      discriminatory, obscene, illegal, or harmful.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick} alt="tick" />
                    <div>
                      <strong>Impersonate others</strong> or provide false
                      information.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick} alt="tick" />
                    <div>
                      <strong>Attempt to interfere</strong> with the security or
                      integrity of the Platform.
                    </div>
                  </div>
                  <div className={styles.listItem}>
                    <img src={tick} alt="tick" />
                    <div>
                      <strong>Use the platform</strong> for unauthorized
                      commercial purposes or unsolicited marketing.
                    </div>
                  </div>
                </div>
                <p>
                  We reserve the right to suspend or terminate your account for
                  violating these Terms or engaging in behavior that negatively
                  impacts the community.
                </p>
              </div>
            </section>

            {/* Section 4: Content Ownership and Licensing */}
            <section id="content-ownership" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                4. Content Ownership and Licensing
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  You retain ownership of any content (such as projects, posts,
                  events, and media) that you submit or display on NexFellow. By
                  submitting content, you grant NexFellow a non-exclusive,
                  worldwide, royalty-free license to use, display, reproduce,
                  and promote that content for the purpose of operating,
                  promoting, and improving the Platform.
                </p>
                <p>
                  You are solely responsible for the content you submit and must
                  ensure you have the necessary rights to share it. NexFellow is
                  not liable for any misuse or misrepresentation of third-party
                  content by users.
                </p>
              </div>
            </section>

            {/* Section 5: Community and Events */}
            <section id="community-events" className={styles.section}>
              <h2 className={styles.sectionTitle}>5. Community and Events</h2>
              <div className={styles.sectionContent}>
                <p>
                  Users may create or join communities, host or participate in
                  events, and collaborate on projects through NexFellow.
                  Community leaders are responsible for managing their members,
                  content, and interactions in accordance with these Terms.
                </p>
                <p>
                  We encourage healthy, inclusive, and growth-oriented
                  environments. NexFellow may intervene, moderate, or remove
                  content or communities that violate policies or foster unsafe
                  interactions.
                </p>
              </div>
            </section>

            {/* Section 6: Privacy */}
            <section id="privacy" className={styles.section}>
              <h2 className={styles.sectionTitle}>6. Privacy</h2>
              <div className={styles.sectionContent}>
                <p>
                  Your privacy is important to us. Please review our{" "}
                  <a href="/privacy" className={styles.contactLink}>
                    Privacy Policy
                  </a>
                  , which explains how we collect, use, and protect your
                  information when you use NexFellow. By using the Platform, you
                  consent to the collection and use of your information as
                  described in our Privacy Policy.
                </p>
              </div>
            </section>

            {/* Section 7: Payments and Fees */}
            <section id="payments-fees" className={styles.section}>
              <h2 className={styles.sectionTitle}>7. Payments and Fees</h2>
              <div className={styles.sectionContent}>
                <p>
                  Certain services or features of NexFellow may require payment.
                  When you purchase paid services, you agree to pay all
                  applicable fees and taxes. Fees are non-refundable unless
                  otherwise stated. NexFellow reserves the right to change its
                  fees at any time, with reasonable notice provided to users.
                </p>
              </div>
            </section>

            {/* Section 8: Third-Party Links and Services */}
            <section id="third-party" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                8. Third-Party Links and Services
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  NexFellow may contain links to third-party websites, tools, or
                  services. These are provided for convenience only. We do not
                  endorse or control third-party content and are not responsible
                  for their availability, accuracy, or policies. Your
                  interactions with such services are solely between you and the
                  third party.
                </p>
              </div>
            </section>

            {/* Section 9: Termination of Use */}
            <section id="termination" className={styles.section}>
              <h2 className={styles.sectionTitle}>9. Termination of Use</h2>
              <div className={styles.sectionContent}>
                <p>
                  We may terminate or suspend your access to NexFellow
                  immediately, without prior notice or liability, if you breach
                  these Terms or violate any applicable law. Upon termination,
                  your right to use the Platform will immediately cease, and we
                  may delete your account and content associated with it.
                </p>
              </div>
            </section>

            {/* Section 10: Disclaimers and Limitation of Liability */}
            <section id="disclaimers" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                10. Disclaimers and Limitation of Liability
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  NexFellow is provided &quot;as is&quot; and &quot;as
                  available&quot; without warranties of any kind, either express
                  or implied. We do not guarantee that the Platform will be
                  uninterrupted, error-free, or secure. To the fullest extent
                  permitted by law, NexFellow disclaims all warranties and will
                  not be liable for any indirect, incidental, special,
                  consequential, or punitive damages arising out of or related
                  to your use of the Platform.
                </p>
              </div>
            </section>

            {/* Section 11: Indemnification */}
            <section id="indemnification" className={styles.section}>
              <h2 className={styles.sectionTitle}>11. Indemnification</h2>
              <div className={styles.sectionContent}>
                <p>
                  You agree to indemnify and hold harmless NexFellow, its
                  affiliates, directors, employees, and agents from any claims,
                  damages, liabilities, costs, or expenses resulting from your
                  use of the Platform, your violation of these Terms, or your
                  infringement of any rights of another.
                </p>
              </div>
            </section>

            {/* Section 12: Modifications to These Terms */}
            <section id="modifications" className={styles.section}>
              <h2 className={styles.sectionTitle}>
                12. Modifications to These Terms
              </h2>
              <div className={styles.sectionContent}>
                <p>
                  We may update these Terms periodically to reflect changes in
                  our services, policies, or legal requirements. If we make
                  significant changes, we will notify users through the Platform
                  or via email. Continued use of NexFellow after such updates
                  constitutes your acceptance of the revised Terms.
                </p>
              </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className={styles.section}>
              <h2 className={styles.sectionTitle}>13. Contact Us</h2>
              <div className={styles.sectionContent}>
                <p>
                  If you have any questions about these Terms of Service, please
                  contact us at:
                </p>

                <div className={styles.contactContainer}>
                  <div className={styles.contactCard}>
                    <div className={styles.contactInfo}>
                      <p className={styles.contactLabel}>
                        NexFellow Support Team
                      </p>
                      <p className={styles.contactValue}>
                        📧 Email:{" "}
                        <a
                          href="mailto:community@nexfellow.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.contactLink}
                        >
                          community@nexfellow.com
                        </a>
                      </p>
                      <p className={styles.contactValue}>
                        🌐 Website:{" "}
                        <a
                          href="https://nexfellow.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.contactLink}
                        >
                          https://nexfellow.com/
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.highlightBox}>
                  <h4 className={styles.highlightTitle}>Agreement</h4>
                  <p>
                    By using NexFellow, you acknowledge that you have read,
                    understood, and agree to be bound by these Terms of Service.
                  </p>
                </div>
              </div>
            </section>

            {/* Back to Top */}
            <div className={styles.backToTop}>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  window.location.hash = "";
                }}
                className={styles.backToTopLink}
              >
                Back to Top
              </button>
            </div>
          </div>
        </div>

        {/* Floating TOC Button */}
        <button
          className={styles.floatingTocButton}
          onClick={() => setShowFloatingToc(true)}
          aria-label="Open table of contents"
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: "block" }}
              aria-hidden="true"
              focusable="false"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="7" y1="8" x2="17" y2="8" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="7" y1="16" x2="13" y2="16" />
            </svg>
          </span>
        </button>

        {/* Floating TOC Modal */}
        <div
          className={`${styles.floatingTocModal} ${
            showFloatingToc ? styles.active : ""
          }`}
        >
          <div className={styles.floatingTocContent}>
            <div className={styles.floatingTocHeader}>
              <h3 className={styles.floatingTocTitle}>Table of Contents</h3>
              <button
                className={styles.floatingTocClose}
                onClick={() => setShowFloatingToc(false)}
                aria-label="Close table of contents"
              >
                ×
              </button>
            </div>
            <nav className={styles.floatingTocNav}>
              {tableOfContents.map((item, index) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={styles.floatingTocLink}
                  onClick={() => setShowFloatingToc(false)}
                >
                  <span className={styles.floatingTocNumber}>{index + 1}.</span>
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Terms;
