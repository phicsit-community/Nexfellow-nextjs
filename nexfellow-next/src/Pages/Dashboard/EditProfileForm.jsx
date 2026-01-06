"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

import api from "../../lib/axios";
import styles from "./EditProfileForm.module.css";

import countryCodeMap from "../../components/Constants/Country";
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

const EditProfileForm = () => {
  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);
  const imgRef = useRef(null);
  const router = useRouter();
  const params = useParams();
  const username = params?.username;
  const [id, setId] = useState(null);
  const [user, setUser] = useState(null);
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
      options: Object.keys(countryCodeMap),
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/user/profile/username/${username}`);
        const userData = response.data;
        setUser(userData);
        setId(userData._id);
        console.log("User Data:", userData);
        setWebsiteLink(
          userData.link ? userData.link.replace(/^https?:\/\//, "") : ""
        );
        setFormData((prevFormData) => ({
          ...prevFormData,
          name: userData.name || "",
          username: userData.username || "",
          email: userData.email || "",
          description: userData.description
            ? userData.description.slice(0, 150)
            : userData.profile.bio,
          country: userData.country || "",
          category: userData.category || "",
          dob: userData.dateOfBirth
            ? new Date(userData.dateOfBirth).toISOString().split("T")[0]
            : "",
          photo: userData.picture || null,
          banner: userData.banner || null,
          accountType: userData.accountType || "",
        }));
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

      if (isCommunityAccount) {
        let formattedWebsiteLink = websiteLink.trim();

        if (!formattedWebsiteLink) {
          // Send empty string to remove link
          await api.put(
            `/community/${id}/link`,
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
            `/community/${id}/link`,
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
