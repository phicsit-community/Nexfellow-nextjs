"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "../../lib/axios";
import { toast } from "react-toastify";
import styles from "./CommunityForm.module.css";
import BackButton from "../../components/BackButton/BackButton";
import {
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineCheckCircle,
  HiOutlineOfficeBuilding,
  HiOutlineDocumentText,
  HiOutlineLink,
  HiOutlineStar,
  HiOutlineTrendingUp,
  HiOutlineSupport,
} from "react-icons/hi";

const categories = [
  "Technology",
  "Business",
  "Finance",
  "Science",
  "Fiction",
  "Health & Wellness",
  "Design",
  "Education",
  "Personal Blog",
  "Web3",
  "Philosophy",
  "History",
  "Music",
];

const initialFormData = {
  pageName: "",
  email: "",
  accountType: "Individual",
  description: "",
  category: "",
  socialLink: "",
};

export default function GetVerified() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  // Get userId from localStorage
  const [userId, setUserId] = useState(null);
  const toastId = React.useRef();

  // Get userId from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user?.id || user?._id) {
        setUserId(user.id || user._id);
      }
    }
  }, []);

  useEffect(() => {
    // Only show toast after initial load and when userId state has been checked
    if (userId === null) return; // Still loading

    if (userId) {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.success("User ID retrieved successfully.");
      }
    } else {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.error("User ID not found. Please log in again.");
      }
    }
  }, [userId]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Validation function
  const validate = (values = formData) => {
    const errs = {};
    if (!values.pageName.trim())
      errs.pageName =
        values.accountType === "Individual"
          ? "Your name is required"
          : "Community name is required";

    if (!values.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(values.email)) errs.email = "Invalid email";

    if (!values.accountType) errs.accountType = "Account type is required";

    if (!values.description.trim())
      errs.description =
        values.accountType === "Individual"
          ? "Description about yourself is required"
          : "Description about your community is required";
    else if (values.description.length < 100)
      errs.description = "Minimum 100 characters required";

    if (!values.category) errs.category = "Category is required";

    return errs;
  };

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newForm = { ...prev, [name]: value };
      setErrors(validate(newForm));
      return newForm;
    });
  };

  // Account type handler
  const handleAccountType = (type) => {
    setFormData((prev) => {
      const newForm = { ...prev, accountType: type };
      setErrors(validate(newForm));
      return newForm;
    });
  };

  // Submit handler (uses FormData)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const currentErrors = validate(formData);
    setErrors(currentErrors);

    if (Object.keys(currentErrors).length > 0) {
      return;
    }

    if (!userId) {
      toast.error("User ID is missing.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append(
        "communityName",
        formData.pageName // We keep "communityName" as key for backend compatibility
      );
      fd.append("description", formData.description);
      fd.append("email", formData.email);
      fd.append("accountType", formData.accountType);
      fd.append("link", formData.socialLink);
      fd.append("category", formData.category);
      fd.append("userId", userId);
      fd.append("action", "create");

      await api.post("/requests/", fd);
      toast.success("Request submitted for verification!");
      router.back();
    } catch (error) {
      toast.error(
        `Failed to submit. ${error.response?.data?.error || "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackButtonClick = () => {
    router.back();
  };

  // Skeleton Loader Component
  const FormSkeletonLoader = () => (
    <div className={styles.form}>
      <div className={styles.formContainer}>
        <div className={styles.inputGrid}>
          <div className={styles.column}>
            <div className={styles.formField}>
              <div className={`${styles.skeletonLabel} ${styles.skeleton}`}></div>
              <div className={`${styles.skeletonFormField} ${styles.skeleton}`}></div>
            </div>
            <div className={styles.formField}>
              <div className={`${styles.skeletonLabel} ${styles.skeleton}`}></div>
              <div className={`${styles.skeletonFormField} ${styles.skeleton}`}></div>
            </div>
            <div className={styles.formField}>
              <div className={`${styles.skeletonLabel} ${styles.skeleton}`}></div>
              <div className={`${styles.skeletonFormField} ${styles.skeleton}`}></div>
            </div>
          </div>
          <div className={styles.column}>
            <div className={styles.formField}>
              <div className={`${styles.skeletonLabel} ${styles.skeleton}`}></div>
              <div className={`${styles.skeletonTextArea} ${styles.skeleton}`}></div>
            </div>
            <div className={styles.formField}>
              <div className={`${styles.skeletonLabel} ${styles.skeleton}`}></div>
              <div className={`${styles.skeletonFormField} ${styles.skeleton}`}></div>
            </div>
            <div className={styles.formField}>
              <div className={`${styles.skeletonLabel} ${styles.skeleton}`}></div>
              <div className={`${styles.skeletonFormField} ${styles.skeleton}`}></div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.submitButtonContainer}>
        <div className={`${styles.skeletonButton} ${styles.skeleton}`}></div>
      </div>
    </div>
  );

  // Is form valid?
  const isFormValid = Object.keys(validate()).length === 0;

  if (initialLoading) return <FormSkeletonLoader />;

  return (
    <div className={styles.bg}>
      <div className={styles.backButtonContainer}>
        <div
          className="border rounded-lg hover:bg-accent text-sm w-fit"
          style={{ padding: "3px 10px" }}
        >
          <BackButton
            onClick={handleBackButtonClick}
            showText={true}
            smallText={true}
          />
        </div>
      </div>
      <div className={styles.headerRow}>
        <div className={styles.header}>
          <HiOutlineShieldCheck className={styles.headerIcon} size={32} />
          <h1 className={styles.title}>Get Verified</h1>
        </div>
        <div className={styles.subtitle}>
          Join the verified community and unlock exclusive benefits
        </div>
      </div>
      <div className={styles.wrapper}>
        {/* Left */}
        <div className={styles.left}>
          <div>
            <div className={styles.cardTitle}>Verification Application</div>
            <div className={styles.cardSubtitle}>
              Please provide accurate information to help us verify your identity and authenticity.
            </div>
            <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
              {/* Account Type (moved to top) */}
              <div className={styles.formGroup}>
                <label>
                  Account Type <span className={styles.required}>*</span>
                </label>
                <div className={styles.accountTypeRow}>
                  <button
                    type="button"
                    className={`${styles.accountTypeBtn} ${formData.accountType === "Individual" ? styles.active : ""
                      }`}
                    onClick={() => handleAccountType("Individual")}
                    tabIndex={0}
                  >
                    <HiOutlineUser className={styles.accountTypeIcon} />
                    Individual
                    {formData.accountType === "Individual" && (
                      <HiOutlineCheckCircle className={styles.checkIcon} />
                    )}
                  </button>
                  <button
                    type="button"
                    className={`${styles.accountTypeBtn} ${formData.accountType === "Organization" ? styles.active : ""
                      }`}
                    onClick={() => handleAccountType("Organization")}
                    tabIndex={0}
                  >
                    <HiOutlineOfficeBuilding className={styles.accountTypeIcon} />
                    Organization
                    {formData.accountType === "Organization" && (
                      <HiOutlineCheckCircle className={styles.checkIcon} />
                    )}
                  </button>
                </div>
                {submitted && errors.accountType && (
                  <div className={styles.error}>{errors.accountType}</div>
                )}
              </div>

              {/* Page/Community Name with dynamic label */}
              <div className={styles.formGroup}>
                <label>
                  {formData.accountType === "Individual"
                    ? "Your Name"
                    : "Community Name"}{" "}
                  <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrap}>
                  <HiOutlineUser className={styles.inputIcon} />
                  <input
                    type="text"
                    name="pageName"
                    value={formData.pageName}
                    onChange={handleChange}
                    placeholder={
                      formData.accountType === "Individual"
                        ? "Enter your name"
                        : "Enter community name"
                    }
                    className={styles.input}
                    autoComplete="off"
                  />
                </div>
                {submitted && errors.pageName && (
                  <div className={styles.error}>{errors.pageName}</div>
                )}
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label>
                  Contact Email <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrap}>
                  <HiOutlineMail className={styles.inputIcon} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter contact email"
                    className={styles.input}
                    autoComplete="off"
                  />
                </div>
                {submitted && errors.email && (
                  <div className={styles.error}>{errors.email}</div>
                )}
              </div>

              {/* Description with dynamic label and placeholder */}
              <div className={styles.formGroup}>
                <label>
                  {formData.accountType === "Individual"
                    ? "Tell us about yourself"
                    : "Tell us about your community"}{" "}
                  <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder={
                    formData.accountType === "Individual"
                      ? "Enter detailed description about yourself, achievements, and why you should be verified..."
                      : "Enter detailed description about your community, achievements, and why it should be verified..."
                  }
                  minLength={100}
                  maxLength={500}
                  className={styles.textarea}
                  autoComplete="off"
                />
                <div className={styles.textareaFooter}>
                  <span className={styles.textareaHint}>
                    Minimum 100 characters recommended
                  </span>
                  <span className={styles.charCount}>
                    {formData.description.length}/500
                  </span>
                </div>
                {submitted && errors.description && (
                  <div className={styles.error}>{errors.description}</div>
                )}
              </div>

              {/* Category */}
              <div className={styles.formGroup}>
                <label>
                  Category <span className={styles.required}>*</span>
                </label>
                <div className={styles.inputWrap}>
                  <HiOutlineDocumentText className={styles.inputIcon} />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={styles.input}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                {submitted && errors.category && (
                  <div className={styles.error}>{errors.category}</div>
                )}
              </div>

              {/* Social Media Link */}
              <div className={styles.formGroup}>
                <label>
                  {formData.accountType === "Individual"
                    ? "Social Media Link"
                    : "Community Social Media Link"}
                </label>
                <div className={styles.inputWrap}>
                  <HiOutlineLink className={styles.inputIcon} />
                  <input
                    type="text"
                    name="socialLink"
                    value={formData.socialLink}
                    onChange={handleChange}
                    placeholder={
                      formData.accountType === "Individual"
                        ? "Enter link to your main social media profile"
                        : "Enter link to your community's main social media profile"
                    }
                    className={styles.input}
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className={styles.terms}>
                By submitting this application, you agree to our{" "}
                <a href="#" className={styles.link}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className={styles.link}>
                  Verification Policy
                </a>
                . We may contact you for additional information during the review
                process.
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || !isFormValid}
              >
                <HiOutlineShieldCheck className={styles.submitIcon} />
                {loading ? "Submitting..." : "Submit Verification Application"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Benefits */}
        <div className={styles.right}>
          <div className={styles.benefitsCard}>
            <div className={styles.benefitsTitle}>Verification Benefits</div>
            <ul className={styles.benefitsList}>
              <li>
                <HiOutlineShieldCheck className={styles.benefitIcon} />
                <div>
                  <div className={styles.benefitLabel}>Verified Badge</div>
                  <div className={styles.benefitDesc}>
                    Get the blue checkmark that shows you’re authentic
                  </div>
                </div>
              </li>
              <li>
                <HiOutlineStar className={styles.benefitIcon} />
                <div>
                  <div className={styles.benefitLabel}>Exclusive Features</div>
                  <div className={styles.benefitDesc}>
                    Access to beta features and advanced analytics
                  </div>
                </div>
              </li>
              <li>
                <HiOutlineTrendingUp className={styles.benefitIcon} />
                <div>
                  <div className={styles.benefitLabel}>Enhanced Visibility</div>
                  <div className={styles.benefitDesc}>
                    Your content gets boosted in search and recommendations
                  </div>
                </div>
              </li>
              <li>
                <HiOutlineSupport className={styles.benefitIcon} />
                <div>
                  <div className={styles.benefitLabel}>Priority Support</div>
                  <div className={styles.benefitDesc}>
                    Access to dedicated support and faster response times
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
