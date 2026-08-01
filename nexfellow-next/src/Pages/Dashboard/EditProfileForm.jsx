"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

import api from "../../lib/axios";
import styles from "./EditProfileForm.module.css";

import { Country, State, City } from "country-state-city";
import BackButton from "../../components/BackButton/BackButton";
import CameraIcon from "./assets/Camera.svg";

import { DatePicker } from "antd";
import { ConfigProvider, theme } from "antd";
const { darkAlgorithm, defaultAlgorithm } = theme;
import "react-day-picker/style.css";
const dateFormat = "YYYY/MM/DD";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { toast } from "sonner";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

dayjs.extend(customParseFormat);

const AVAIL_MAP = {
  "Yes — actively looking": "actively-looking",
  "Maybe — open to conversations": "open-to-conversations",
  "No — building solo": "building-solo",
  "Advisor / mentor": "advisor-mentor",
};
const AVAIL_REVERSE_MAP = {
  "actively-looking": "Yes — actively looking",
  "open-to-conversations": "Maybe — open to conversations",
  "building-solo": "No — building solo",
  "advisor-mentor": "Advisor / mentor",
};

const SKILLS_OPTIONS = [
  "Full-stack dev", "Frontend dev", "Backend dev", "Mobile dev",
  "Product design", "UI/UX", "Product strategy", "Growth hacking",
  "Marketing", "Sales", "AI / ML", "No-code / low-code", "Fundraising", "Operations",
];
const COFOUNDER_OPTIONS = [
  "Technical co-founder", "Design co-founder", "Growth / marketing",
  "Sales co-founder", "Business co-founder", "AI / ML expertise",
];
const INTEREST_OPTIONS = [
  "SaaS / web apps", "Mobile apps", "AI tools", "Dev tools",
  "E-commerce", "Fintech", "Edtech", "Health / wellness", "No-code tools", "Hardware / IoT",
];

const EditProfileForm = () => {
  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const imgRef = useRef(null);
  const router = useRouter();
  const params = useParams();
  const username = params?.username;
  const searchParams = useSearchParams();
  const [id, setId] = useState(null);
  const [communityId, setCommunityId] = useState(null);
  const [user, setUser] = useState(null);
  const [connectingPlatform, setConnectingPlatform] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    description: "",
    country: "",
    category: "",
    dob: "",
    photo: null,
    banner: null,
    accountType: "",
  });
  const [loading, setLoading] = useState(true);

  // Location state
  const [countryIso, setCountryIso] = useState("");
  const [stateIso, setStateIso] = useState("");
  const [cityName, setCityName] = useState("");

  // New profile fields
  const [skills, setSkills] = useState([]);
  const [cofounderAvailability, setCofounderAvailability] = useState("Maybe — open to conversations");
  const [cofounderLookingFor, setCofounderLookingFor] = useState([]);
  const [reviewInterests, setReviewInterests] = useState([]);
  const [socialLinks, setSocialLinks] = useState({ twitter: "", github: "", linkedin: "", portfolio: "" });

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState({
    checking: false,
    available: null,
    message: "",
  });
  const debounceTimeoutRef = useRef(null);

  // Crop state variables
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropType, setCropType] = useState(""); // 'banner' or 'profile'
  const [cropImage, setCropImage] = useState("");
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageSource, setImageSource] = useState(null); // Original file for reference
  const [websiteLink, setWebsiteLink] = useState("");
  const [crop, setCrop] = useState({
    unit: "px",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const dark = document.documentElement.classList.contains("dark");
    setIsDarkMode(dark);
  }, []);

  const categoryOptions = [
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

  const accountTypeOptions = ["Individual", "Organization"];

  const formFields = {
    name: { label: "Name", type: "text", required: true },
    description: {
      label: "Description",
      type: "textarea",
      required: true,
      maxLength: 150,
    },
    country: {
      label: "Country",
      type: "select",
      required: true,
      options: Country.getAllCountries().map((c) => c.name),
    },
    username: { label: "User Name", type: "text", required: true },
    email: { label: "Email", type: "email", required: true },
    category: {
      label: "Category",
      type: "select",
      required: true,
      options: categoryOptions,
    },
    dob: {
      label: "Date of Birth",
      type: "date",
      required: true,
      value: formData.dob,
      onChange: (date) => {
        const adjustedDate = date
          ? new Date(date.setDate(date.getDate() + 1))
          : null;
        setFormData((prev) => ({
          ...prev,
          dob: adjustedDate ? adjustedDate.toISOString().split("T")[0] : "",
        }));
      },
    },
    accountType: {
      label: "Account Type",
      type: "select",
      required: true,
      options: accountTypeOptions,
    },
  };

  const handleBackButtonClick = () => {
    router.back();
  };

  const connectPlatform = async (platform) => {
    setConnectingPlatform(platform);
    try {
      const { data } = await api.post("/auth/connect/init", {
        platform,
        returnTo: `/edit-profile/${username}`,
      });
      window.location.href = data.oauthUrl;
    } catch {
      toast.error(`Failed to start ${platform} connection. Please try again.`);
      setConnectingPlatform(null);
    }
  };

  // Handle return from OAuth connect redirect (?connected=github&handle=xxx)
  useEffect(() => {
    const connected = searchParams.get("connected");
    const handle = searchParams.get("handle");
    const connectErr = searchParams.get("connect_error");

    if (connectErr) {
      toast.error("Could not connect account. Please try again.");
      window.history.replaceState({}, "", `/edit-profile/${username}`);
      setConnectingPlatform(null);
      return;
    }

    if (connected && handle) {
      const decodedHandle = decodeURIComponent(handle);
      toast.success(
        `${connected === "github" ? "GitHub" : "LinkedIn"} connected successfully!`
      );
      setUser((prev) =>
        prev && {
          ...prev,
          connectedAccounts: {
            ...prev.connectedAccounts,
            [connected]: { connected: true, handle: decodedHandle },
          },
        }
      );
      window.history.replaceState({}, "", `/edit-profile/${username}`);
      setConnectingPlatform(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/user/profile/username/${username}`);
        const userData = response.data;
        setUser(userData);
        setId(userData._id);
        setCommunityId(userData.createdCommunity?._id || null);
        console.log("User Data:", userData);
        setWebsiteLink(
          userData.link ? userData.link.replace(/^https?:\/\//, "") : ""
        );
        const isCommunity = userData.isCommunityAccount && userData.createdCommunity;
        setFormData((prevFormData) => ({
          ...prevFormData,
          name: userData.name || "",
          username: userData.username || "",
          email: userData.email || "",
          description: isCommunity
            ? (userData.createdCommunity?.description || "").slice(0, 150)
            : (userData.description || userData.profile?.bio || userData.bio || "").slice(0, 150),
          country: userData.country || "",
          category: userData.category || userData.createdCommunity?.category || "",
          dob: userData.dateOfBirth
            ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
            : "",
          photo: userData.picture || null,
          banner: userData.banner || null,
          accountType: userData.accountType || userData.createdCommunity?.accountType || "",
        }));

        // Resolve country ISO code for state/city cascade
        const countryObj = Country.getAllCountries().find(
          (c) => c.name === (userData.country || "")
        );
        const iso = countryObj?.isoCode || "";
        setCountryIso(iso);
        if (iso && userData.state) {
          const stateObj = State.getStatesOfCountry(iso).find(
            (s) => s.name === userData.state
          );
          setStateIso(stateObj?.isoCode || "");
        }
        setCityName(userData.city || "");
        setSkills(userData.skills || []);
        setCofounderAvailability(
          AVAIL_REVERSE_MAP[userData.cofounderAvailability] ||
            "Maybe — open to conversations"
        );
        setCofounderLookingFor(userData.cofounderLookingFor || []);
        setReviewInterests(userData.reviewInterests || []);
        setSocialLinks(
          userData.socialLinks || { twitter: "", github: "", linkedin: "", portfolio: "" }
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

  // Cleanup debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Function to check username availability
  const checkUsernameAvailability = async (username) => {
    try {
      setUsernameStatus((prev) => ({ ...prev, checking: true, message: "" }));

      const response = await api.get(`/user/check-username/${username}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setUsernameStatus({
          checking: false,
          available: true,
          message: "Username is available!",
        });
      }
    } catch (error) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: error.response?.data?.message || "Username is not available",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "description"
        ? value.slice(0, 150)
        : name === "name"
          ? value.slice(0, 20)
          : value,
    }));

    // Sync country ISO for cascading state/city dropdowns
    if (name === "country") {
      const countryObj = Country.getAllCountries().find((c) => c.name === value);
      setCountryIso(countryObj?.isoCode || "");
      setStateIso("");
      setCityName("");
    }

    // Handle username validation with debouncing
    if (name === "username") {
      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Reset username status if empty or same as current
      if (!value.trim() || value === user?.username) {
        setUsernameStatus({
          checking: false,
          available: null,
          message: "",
        });
        return;
      }

      // Set debounced API call
      debounceTimeoutRef.current = setTimeout(() => {
        checkUsernameAvailability(value.trim());
      }, 500);
    }
  };

  const handleFileUpload = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      const file = files[0]; // Set the crop type based on file input name
      setCropType(name);

      // Create a URL for the image to be cropped
      const imageUrl = URL.createObjectURL(file);
      setCropImage(imageUrl);
      setImageSource(file);

      // Pre-load the image to get dimensions before showing crop modal
      const img = new Image();
      img.onload = () => {
        // Calculate initial crop based on aspect ratio and image dimensions
        const aspectRatio = name === "banner" ? 5 / 1.5 : 1 / 1;

        // Set initial crop to center of image with proper aspect ratio
        const width = Math.min(80, (img.width * 80) / 100);
        const height = name === "banner" ? width / aspectRatio : width;

        setCrop({
          unit: "px",
          width: width * 2.5,
          height: height * 2.5,
          x: (100 - width) / 2,
          y: (100 - height) / 2,
        });

        // Show crop modal after image is loaded
        setShowCropModal(true);
      };
      img.src = imageUrl;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sanitizedUsername = formData.username.replace(/\s/g, "");
      if (sanitizedUsername !== formData.username) {
        toast.error("Username cannot contain spaces.");
        setLoading(false);
        return;
      }

      if (isCommunityAccount && communityId) {
        let formattedWebsiteLink = websiteLink.trim();

        if (!formattedWebsiteLink) {
          // Send empty string to remove link
          await api.put(
            `/community/${communityId}/link`,
            { link: "" },
            { withCredentials: true }
          );
        } else {
          formattedWebsiteLink =
            "https://" + formattedWebsiteLink.replace(/^https?:\/\//, "");

          try {
            new URL(formattedWebsiteLink);
          } catch {
            toast.error("Please enter a valid website link.");
            setLoading(false);
            return;
          }

          await api.put(
            `/community/${communityId}/link`,
            { link: formattedWebsiteLink },
            { withCredentials: true }
          );
        }
      }

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        let value = formData[key];
        if (key === "username") value = sanitizedUsername;
        if (value !== null && value !== "") {
          data.append(key, value);
        }
      });

      // Append location fields (always send so values can be cleared)
      const stateName = stateIso
        ? State.getStateByCodeAndCountry(stateIso, countryIso)?.name || ""
        : "";
      data.append("city", cityName);
      data.append("state", stateName);

      // Append array/object fields as JSON (always send so clearing is persisted)
      data.append("skills", JSON.stringify(skills));
      data.append("cofounderLookingFor", JSON.stringify(cofounderLookingFor));
      data.append("reviewInterests", JSON.stringify(reviewInterests));
      data.append("socialLinks", JSON.stringify(socialLinks));
      data.append(
        "cofounderAvailability",
        AVAIL_MAP[cofounderAvailability] || "open-to-conversations"
      );

      const response = await api.post("/user/updateprofile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.user) {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        const userResponse = await api.get(
          `/user/profile/username/${sanitizedUsername}`
        );
        if (userResponse.data) {
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const updatedUser = { ...currentUser, ...userResponse.data };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }

      toast.success("Profile updated successfully!", { duration: 3000 });
      if (sanitizedUsername) {
        router.push(`/dashboard/${sanitizedUsername}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to apply crop
  const applyImageCrop = () => {
    if (!completedCrop || !imgRef.current) return;

    // Desired output size for banner
    const outputWidth = cropType === "banner" ? 1300 : completedCrop.width;
    const outputHeight = cropType === "banner" ? 392 : completedCrop.height;

    const canvas = document.createElement("canvas");
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    const ctx = canvas.getContext("2d");

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Draw the cropped image scaled to the output size
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputWidth,
      outputHeight
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Canvas is empty");
          return;
        }
        const croppedFile = new File(
          [blob],
          imageSource.name || `${cropType}.jpg`,
          {
            type: imageSource.type || "image/jpeg",
          }
        );
        setFormData((prev) => ({
          ...prev,
          [cropType]: croppedFile,
        }));
        setShowCropModal(false);
        URL.revokeObjectURL(cropImage);
      },
      imageSource.type || "image/jpeg",
      1 // high quality
    );
  };

  const onImageLoad = (img) => {
    imgRef.current = img;
    setCrop({
      unit: "px",
      x: 0,
      y: 0,
      width: img.naturalWidth || imgRef.current.naturalWidth,
      height: img.naturalHeight || imgRef.current.naturalHeight,
    });
    return false;
  };

  // Function to cancel crop
  const cancelCrop = () => {
    setShowCropModal(false);
    URL.revokeObjectURL(cropImage);
  };

  // Skeleton Loader Components
  const SkeletonLoader = () => (
    <div className={styles.form}>
      <div className={styles.uploadSection}>
        <h3 className={styles.title}>Upload Photo</h3>
        <p className={styles.dimensions}>
          Suggested dimension for banner [1300x392]
        </p>
        <div className={`${styles.skeletonDropzone} ${styles.skeleton}`}></div>
        <div
          className={`${styles.skeletonProfileImage} ${styles.skeleton}`}
        ></div>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.inputGrid}>
          {/* Column 1 Skeleton */}
          <div className={styles.column}>
            {[1, 2, 3].map((i) => (
              <div className={styles.formField} key={`col1-${i}`}>
                <div
                  className={`${styles.skeletonFormField} ${styles.skeleton}`}
                ></div>
              </div>
            ))}
            <div className={styles.formField}>
              <div
                className={`${styles.skeletonTextArea} ${styles.skeleton}`}
              ></div>
            </div>
          </div>

          {/* Column 2 Skeleton */}
          <div className={styles.column}>
            {[1, 2, 3, 4].map((i) => (
              <div className={styles.formField} key={`col2-${i}`}>
                <div
                  className={`${styles.skeletonFormField} ${styles.skeleton}`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.submitButtonContainer}>
        <div className={`${styles.skeletonButton} ${styles.skeleton}`}></div>
      </div>
    </div>
  );

  const isCommunityAccount = user?.isCommunityAccount && user?.createdCommunity;

  return (
    <div className={styles.container}>
      <div className={styles.backButtonContainer}>
        <div
          className="border rounded-lg hover:bg-accent text-sm w-fit"
          style={{ padding: "3px 10px" }}
        >
          <BackButton
            onClick={() => router.back()}
            showText={true}
            smallText={true}
          />
        </div>
      </div>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.uploadSection}>
            <h3 className={styles.title}>Upload Photo</h3>
            <p className={styles.dimensions}>
              Suggested dimension for banner [1300x392]
            </p>
            <div
              className={styles.dropzone}
              onClick={() => bannerInputRef.current?.click()}
            >
              <input
                className={styles.bannerInput}
                type="file"
                name="banner"
                ref={bannerInputRef}
                onChange={handleFileUpload}
              />
              {formData.banner ? (
                <div className={styles.imageContainer}>
                  {/* Overlay */}
                  <div className={styles.overlay}></div>

                  <img
                    src={
                      typeof formData.banner === "string" &&
                        formData.banner.startsWith("https")
                        ? formData.banner
                        : formData.banner instanceof File ||
                          formData.banner instanceof Blob
                          ? URL.createObjectURL(formData.banner)
                          : ""
                    }
                    alt="Uploaded banner"
                    className={styles.uploadedImage}
                    onError={(e) => (e.target.style.display = "none")}
                  />

                  <div className={styles.centerIcons}>
                    <div
                      className={styles.cameraIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        bannerInputRef.current?.click();
                      }}
                    >
                      <img
                        src={CameraIcon?.src || CameraIcon}
                        alt="Camera"
                        className={styles.customCameraIcon}
                      />
                    </div>
                    <div
                      className={styles.crossIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({
                          ...prev,
                          banner: null,
                          photo: null,
                        }));
                      }}
                    >
                      <i className="fas fa-times"></i>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.placeholder}>
                  <i className="fas fa-images galleryIcon"></i>
                </div>
              )}
            </div>
            <div
              className={styles.cameraFrame}
              onClick={() => profileInputRef.current?.click()}
            >
              <input
                className={styles.profileInput}
                type="file"
                ref={profileInputRef}
                name="photo"
                onChange={handleFileUpload}
              />
              <div className={styles.imageContainer}>
                {/* Overlay */}
                <div className={styles.overlay}></div>

                {formData.photo ? (
                  <img
                    src={
                      typeof formData.photo === "string" &&
                        formData.photo.startsWith("https")
                        ? formData.photo
                        : formData.photo instanceof File ||
                          formData.photo instanceof Blob
                          ? URL.createObjectURL(formData.photo)
                          : ""
                    }
                    alt="Uploaded photo"
                    className={styles.uploadedImage}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : null}

                <div className={styles.centerIcons}>
                  <div
                    className={styles.cameraIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      profileInputRef.current?.click();
                    }}
                  >
                    <img
                      src={CameraIcon?.src || CameraIcon}
                      alt="Camera"
                      className={styles.customCameraIcon}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formContainer}>
            <div className={styles.inputGrid}>
              {/* Column 1 */}
              <div className={styles.column}>
                {Object.entries(formFields)
                  .slice(0, 3)
                  .map(([key, field]) => (
                    <div className={styles.formField} key={key}>
                      <label className={styles.label}>
                        {field.label}{" "}
                        {field.required && (
                          <span className={styles.required}>*</span>
                        )}
                      </label>
                      {key === "description" ? (
                        <div className={styles.textareaWrapper}>
                          <textarea
                            className={styles.textarea}
                            name={key}
                            value={formData[key] || ""}
                            onChange={handleChange}
                            required={field.required}
                            maxLength={150}
                          />
                          <span className={styles.charCount}>
                            {150 - (formData[key] ? formData[key].length : 0)}{" "}
                            characters left
                          </span>
                        </div>
                      ) : field.type === "select" ? (
                        <select
                          className={styles.select}
                          name={key}
                          value={formData[key] || ""}
                          onChange={handleChange}
                          required={field.required}
                        >
                          <option value="">Select</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : key === "name" ? (
                        <div style={{ position: "relative" }}>
                          <input
                            className={styles.input}
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            maxLength={20}
                            required
                          />
                          <div
                            className={`${styles.usernameStatus} ${formData.name.length >= 20 ? styles.unavailable : styles.available}`}
                            style={{
                              marginTop: "5px",
                              position: "static",
                              right: "unset",
                              top: "unset",
                              transform: "none",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}
                          >
                            {formData.name.length < 20 ? (
                              <>
                                <i className="fas fa-check-circle" style={{ color: "#27ae60" }}></i>
                                {20 - formData.name.length} characters left
                              </>
                            ) : (
                              <>
                                <i className="fas fa-times-circle" style={{ color: "#e74c3c" }}></i>
                                Max 20 characters
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <input
                            className={styles.input}
                            type={field.type}
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                            required={field.required}
                            disabled={field.disabled || false}
                          />
                          {key === "username" && (
                            <div
                              className={`${styles.usernameStatus} ${usernameStatus.checking
                                ? styles.checking
                                : usernameStatus.available === true
                                  ? styles.available
                                  : usernameStatus.available === false
                                    ? styles.unavailable
                                    : ""
                                }`}
                            >
                              {usernameStatus.checking && (
                                <>
                                  <i className="fas fa-spinner fa-spin"></i>
                                  Checking availability...
                                </>
                              )}
                              {usernameStatus.available === true && (
                                <>
                                  <i className="fas fa-check-circle"></i>
                                  {usernameStatus.message}
                                </>
                              )}
                              {usernameStatus.available === false && (
                                <>
                                  <i className="fas fa-times-circle"></i>
                                  {usernameStatus.message}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                {/* State / Region — shown only when a country with states is selected */}
                {countryIso && State.getStatesOfCountry(countryIso).length > 0 && (
                  <div className={styles.formField}>
                    <label className={styles.label}>State / Region</label>
                    <select
                      className={styles.select}
                      value={stateIso}
                      onChange={(e) => {
                        setStateIso(e.target.value);
                        setCityName("");
                      }}
                    >
                      <option value="">Select</option>
                      {State.getStatesOfCountry(countryIso).map((s) => (
                        <option key={s.isoCode} value={s.isoCode}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* City — shown only when a state is selected */}
                {stateIso && (
                  <div className={styles.formField}>
                    <label className={styles.label}>City</label>
                    <select
                      className={styles.select}
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                    >
                      <option value="">Select</option>
                      {City.getCitiesOfState(countryIso, stateIso).map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isCommunityAccount && (
                  <div className={styles.formField}>
                    <label className={styles.label}>Website Link</label>
                    <div className={styles.websiteInputWrapper}>
                      <span className={styles.websitePrefix}>https://</span>
                      <input
                        className={styles.websiteInput}
                        type="text"
                        name="websiteLink"
                        placeholder="yourwebsite.com"
                        value={websiteLink}
                        onChange={(e) =>
                          setWebsiteLink(
                            e.target.value.replace(/^https?:\/\//, "")
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* Column 2 */}
              <div className={styles.column}>
                {Object.entries(formFields)
                  .slice(3)
                  .map(([key, field]) => {
                    if (
                      !isCommunityAccount &&
                      (key === "category" || key === "accountType")
                    ) {
                      return null;
                    }

                    return (
                      <div className={styles.formField} key={key}>
                        <label className={styles.label}>
                          {field.label}{" "}
                          {field.required && (
                            <span className={styles.required}>*</span>
                          )}
                        </label>

                        {field.type === "select" ? (
                          <select
                            className={styles.select}
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                            required={field.required}
                          >
                            <option value="">Select</option>
                            {field.options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : field.type === "date" ? (
                          <ConfigProvider theme={{ algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm }}>
                            <DatePicker
                              styles={{ activeBorderColor: "#24b2b4" }}
                              className={styles.input}
                              onChange={(date) =>
                                field.onChange(date ? date.toDate() : null)
                              }
                              value={field.value ? dayjs(field.value) : null}
                              format={dateFormat}
                            />
                          </ConfigProvider>
                        ) : (
                          <div>
                            <input
                              className={styles.input}
                              type={field.type}
                              name={key}
                              value={formData[key]}
                              onChange={handleChange}
                              required={field.required}
                              disabled={field.disabled || false}
                            />
                            {key === "username" && (
                              <div
                                className={`${styles.usernameStatus} ${usernameStatus.checking
                                  ? styles.checking
                                  : usernameStatus.available === true
                                    ? styles.available
                                    : usernameStatus.available === false
                                      ? styles.unavailable
                                      : ""
                                  }`}
                              >
                                {usernameStatus.checking && (
                                  <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Checking availability...
                                  </>
                                )}
                                {usernameStatus.available === true && (
                                  <>
                                    <i className="fas fa-check-circle"></i>
                                    {usernameStatus.message}
                                  </>
                                )}
                                {usernameStatus.available === false && (
                                  <>
                                    <i className="fas fa-times-circle"></i>
                                    {usernameStatus.message}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* ── Skills ── */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>Skills</h4>
            <p className={styles.sectionSub}>Select all that apply</p>
            <div className={styles.chipGrid}>
              {SKILLS_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className={`${styles.chip} ${skills.includes(skill) ? styles.chipSelected : ""}`}
                  onClick={() =>
                    setSkills((prev) =>
                      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
                    )
                  }
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* ── Social Links ── */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>Social Links</h4>
            <div className={styles.socialLinksGrid}>
              {[
                { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/username" },
                { key: "portfolio", label: "Portfolio / Website", placeholder: "https://yourwebsite.com" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className={styles.formField}>
                  <label className={styles.label}>{label}</label>
                  <input
                    className={`${styles.input} ${styles.socialInput}`}
                    type="text"
                    placeholder={placeholder}
                    value={socialLinks[key] || ""}
                    onChange={(e) =>
                      setSocialLinks((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Connected Accounts (OAuth) ── */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>Connected Accounts</h4>
            <p className={styles.sectionSub}>
              Link your GitHub and LinkedIn via OAuth to verify ownership.
            </p>
            <div className={styles.connectedAccountsGrid}>
              <div className={styles.connectAccountRow}>
                <div
                  className={styles.connectAccountIcon}
                  style={{ background: "#24292e" }}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M9 2a7 7 0 00-2.21 13.64c.35.06.48-.15.48-.34v-1.2c-1.94.42-2.35-.94-2.35-.94-.32-.81-.78-1.02-.78-1.02-.64-.43.05-.43.05-.43.7.05 1.07.72 1.07.72.63 1.07 1.64.76 2.04.58.06-.45.24-.76.44-.94-1.55-.18-3.18-.78-3.18-3.46 0-.76.27-1.39.72-1.87-.07-.18-.31-.89.07-1.85 0 0 .59-.19 1.92.72a6.7 6.7 0 013.5 0c1.33-.91 1.92-.72 1.92-.72.38.96.14 1.67.07 1.85.45.48.72 1.11.72 1.87 0 2.69-1.64 3.28-3.2 3.45.25.22.48.65.48 1.3v1.94c0 .19.13.4.48.34A7 7 0 009 2z"
                      fill="#ffffff"
                    />
                  </svg>
                </div>
                <div className={styles.connectAccountInfo}>
                  <div className={styles.connectAccountName}>GitHub</div>
                  <div className={styles.connectAccountHandle}>
                    {user?.connectedAccounts?.github?.connected
                      ? `@${user.connectedAccounts.github.handle || "connected"}`
                      : "Not connected"}
                  </div>
                </div>
                {user?.connectedAccounts?.github?.connected ? (
                  <button
                    type="button"
                    className={`${styles.connectBtn} ${styles.connectBtnDone}`}
                    disabled
                  >
                    Connected ✓
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.connectBtn}
                    onClick={() => connectPlatform("github")}
                    disabled={connectingPlatform === "github"}
                  >
                    {connectingPlatform === "github" ? "…" : "Connect"}
                  </button>
                )}
              </div>

              <div className={styles.connectAccountRow}>
                <div
                  className={styles.connectAccountIcon}
                  style={{ background: "#0a66c2" }}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="6" width="2.5" height="9" fill="#fff" />
                    <circle cx="3.25" cy="3.5" r="1.5" fill="#fff" />
                    <path
                      d="M8 6v9M8 9.5a3 3 0 016 0V15"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className={styles.connectAccountInfo}>
                  <div className={styles.connectAccountName}>LinkedIn</div>
                  <div className={styles.connectAccountHandle}>
                    {user?.connectedAccounts?.linkedin?.connected
                      ? user.connectedAccounts.linkedin.handle || "Connected"
                      : "Not connected"}
                  </div>
                </div>
                {user?.connectedAccounts?.linkedin?.connected ? (
                  <button
                    type="button"
                    className={`${styles.connectBtn} ${styles.connectBtnDone}`}
                    disabled
                  >
                    Connected ✓
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.connectBtn}
                    onClick={() => connectPlatform("linkedin")}
                    disabled={connectingPlatform === "linkedin"}
                  >
                    {connectingPlatform === "linkedin" ? "…" : "Connect"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Co-founder Status (individual accounts only) ── */}
          {!isCommunityAccount && (
            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>Co-founder Status</h4>
              <div className={styles.availCards}>
                {[
                  { val: "Yes — actively looking", dot: "#10b981", desc: "I'm open to meeting potential co-founders right now." },
                  { val: "Maybe — open to conversations", dot: "#f59e0b", desc: "Not actively searching, but happy to connect if there's a fit." },
                  { val: "No — building solo", dot: "#6b7280", desc: "I'm heads-down on my own product." },
                  { val: "Advisor / mentor", dot: "#24b2b4", desc: "I want to advise early-stage builders, not co-found." },
                ].map(({ val, dot, desc }) => (
                  <div
                    key={val}
                    className={`${styles.availCard} ${cofounderAvailability === val ? styles.availCardSelected : ""}`}
                    onClick={() => setCofounderAvailability(val)}
                  >
                    <div className={styles.availDot} style={{ background: dot }} />
                    <div>
                      <div className={styles.availTitle}>{val}</div>
                      <div className={styles.availDesc}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <label className={styles.label} style={{ marginTop: "16px", display: "block" }}>
                What kind of co-founder are you looking for?
              </label>
              <div className={styles.chipGrid} style={{ marginTop: "8px" }}>
                {COFOUNDER_OPTIONS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`${styles.chip} ${cofounderLookingFor.includes(val) ? styles.chipSelected : ""}`}
                    onClick={() =>
                      setCofounderLookingFor((prev) =>
                        prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
                      )
                    }
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Review Interests ── */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>Review Interests</h4>
            <p className={styles.sectionSub}>Types of products you want to review</p>
            <div className={styles.chipGrid}>
              {INTEREST_OPTIONS.map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`${styles.chip} ${reviewInterests.includes(val) ? styles.chipSelected : ""}`}
                  onClick={() =>
                    setReviewInterests((prev) =>
                      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
                    )
                  }
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.submitButtonContainer}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={
                loading ||
                usernameStatus.checking ||
                usernameStatus.available === false
              }
            >
              {loading ? (
                <div className={styles.spinner}></div>
              ) : (
                "Update Profile"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Crop Modal */}
      {showCropModal && (
        <div className={styles.cropModalOverlay}>
          <div className={styles.cropModal}>
            <h3>
              Crop Your {cropType === "banner" ? "Banner" : "Profile Picture"}
            </h3>
            <div className={styles.cropContainer}>
              <ReactCrop
                src={cropImage}
                onImageLoaded={onImageLoad}
                crop={crop}
                onChange={(newCrop) => setCrop(newCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={cropType === "banner" ? 5 / 1.5 : 1 / 1}
                circularCrop={cropType === "photo"}
                style={{ maxWidth: "500px", maxHeight: "500px" }}
              >
                <img
                  src={cropImage}
                  alt="Crop preview"
                  style={{ maxWidth: "100%" }}
                  onLoad={(e) => {
                    imgRef.current = e.currentTarget;
                  }}
                />
              </ReactCrop>
            </div>
            <div className={styles.cropButtonContainer}>
              <button
                type="button"
                onClick={cancelCrop}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyImageCrop}
                className={styles.applyButton}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfileForm;
