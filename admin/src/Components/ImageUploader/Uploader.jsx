import React, { useState, useRef } from "react";
import styles from "./Uploader.module.css"; // Import the CSS module
import { RxPencil1 } from "react-icons/rx";

const Tropy = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="7rem"
      height="7rem"
      style={{ transform: "rotate(5deg)" }}
      viewBox="0 0 64 64"
    >
      <path
        fill="#f2b200"
        d="M12.7 31.7c-.5 0-1.1-.1-1.5-.4c-1.3-.7-2.9-2.5-2.9-7.3c0-10-5.4-15.8-5.4-15.8l-.9-1L6.7 2l.8 1.2c.1.1 2.6 3.7 6.5 2.7l.5 2.6c-3.9 1-6.7-1.1-8.1-2.6l-1 1.3c1.7 2.2 5.3 8 5.3 16.8c0 2.6.5 4.4 1.5 4.9c.7.4 1.8 0 2.8-1c2.6-2.6 4.5-9 4.5-9l2.2.8c-.1.3-2.1 7.2-5.2 10.2c-1.3 1.2-2.6 1.8-3.8 1.8m38.6 0c.5 0 1.1-.1 1.5-.4c1.3-.7 2.9-2.5 2.9-7.3c0-10.1 5.3-15.8 5.4-15.9l.9-.9L57.3 2l-.8 1.2c-.1.1-2.6 3.7-6.5 2.7l-.5 2.6c3.9 1 6.7-1.1 8.1-2.6l1.2 1.3c-1.7 2.2-5.3 8-5.3 16.8c0 2.6-.5 4.4-1.5 4.9c-.7.4-1.8 0-2.8-1c-2.6-2.6-4.5-9-4.5-9l-2.2.8c.1.3 2.1 7.2 5.2 10.2c1.1 1.2 2.4 1.8 3.6 1.8M29 24.9h6.1v24.5H29z"
      ></path>
      <path fill="#ffce31" d="M30.2 24.9h3.6v24.5h-3.6z"></path>
      <path
        fill="#f2b200"
        d="M11.8 2C13.5 17.4 21.9 29.7 32 29.7S50.5 17.4 52.2 2z"
      ></path>
      <path
        fill="#ffce31"
        d="M15.7 2c1.4 15.6 8.2 28 16.3 28S46.9 17.6 48.3 2z"
      ></path>
      <path fill="#f2b200" d="M47.6 54H16.4s7-9 15.6-9s15.6 9 15.6 9"></path>
      <path
        fill="#ffce31"
        d="M43.9 54H20.1s5.3-9.2 11.9-9.2S43.9 54 43.9 54"
      ></path>
      <path fill="#bc845e" d="M11.8 56h40.4v6H11.8z"></path>
      <path fill="#916140" d="M16.4 54h31.3v2H16.4z"></path>
      <path fill="#f2b200" d="M22 57.5h20v3H22z"></path>
      <path fill="#ce9c7a" d="M11.8 56h2v6h-2z"></path>
      <path fill="#916140" d="M50.2 56h2v6h-2z"></path>
      <path fill="#ffce31" d="M23 57.5h18v3H23z"></path>
    </svg>
  );
};

const ImageUploader = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={styles.imageUploader}>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageChange}
        style={{ display: "none" }}
      />
      {selectedImage ? (
        <div className={styles.imagePreview}>
          <img
            src={selectedImage}
            alt="Selected Preview"
            className={styles.previewImage}
          />
        </div>
      ) : (
        <div className={styles.imagePreview}>
          <Tropy />
        </div>
      )}

      <div className={styles.editIcon} onClick={handleEditClick}>
        <RxPencil1 className={styles.pencil} />
      </div>
    </div>
  );
};

export default ImageUploader;
