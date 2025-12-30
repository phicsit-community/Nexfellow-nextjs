import { useState, useEffect, useRef, useCallback } from "react";
import Picker from "emoji-picker-react";
import {
  FaRegSmile,
  FaUsers,
  FaNewspaper,
  FaComments,
  FaChevronDown,
  FaEdit,
  FaTrash,
  FaRegClock,
} from "react-icons/fa";
import { MdPhotoLibrary, MdOutlineNoteAdd } from "react-icons/md";
import { IoClose, IoArrowBack } from "react-icons/io5";
import styles from "./PostDialog.module.css";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const PostDialog = ({ isOpen, onClose, onSubmit, post }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [privacy, setPrivacy] = useState("Public");
  const [removedAttachments, setRemovedAttachments] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Select Channel");
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [searchDraft, setSearchDraft] = useState("");
  const textareaRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);
  const lastSavedContentRef = useRef("");
  const MAX_FILE_SIZE = 3 * 1024 * 1024;

  useEffect(() => {
    const savedDrafts = localStorage.getItem("postDrafts");
    if (savedDrafts) {
      try {
        setDrafts(JSON.parse(savedDrafts));
      } catch (e) {
        console.error("Error parsing drafts from localStorage:", e);
        setDrafts([]);
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen && textareaRef.current && !post && !content) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 300);
    }
  }, [isOpen, post, content]);

  const saveDraft = useCallback(
    (showToast = true) => {
      const trimmedContent = content.trim();
      if (!trimmedContent || trimmedContent.length < 3) return;

      // Don't save if content hasn't changed since last save
      if (lastSavedContentRef.current === trimmedContent) return;

      const newDraft = {
        id: Date.now().toString(),
        content: trimmedContent,
        attachments,
        timestamp: new Date().toISOString(),
        channel: selectedOption !== "Select Channel" ? selectedOption : "Feed",
      };

      setDrafts((currentDrafts) => {
        const similarDraft = currentDrafts.find(
          (d) => d.content.trim() === trimmedContent
        );

        let updatedDrafts;
        if (similarDraft) {
          updatedDrafts = currentDrafts.map((d) =>
            d.id === similarDraft.id
              ? { ...d, timestamp: new Date().toISOString() }
              : d
          );
          if (showToast) toast("Draft updated");
        } else {
          updatedDrafts = [newDraft, ...currentDrafts].slice(0, 20);
          toast("Draft saved");
        }

        localStorage.setItem("postDrafts", JSON.stringify(updatedDrafts));
        return updatedDrafts;
      });

      // Update the last saved content reference
      lastSavedContentRef.current = trimmedContent;
    },
    [content, attachments, selectedOption]
  );

  useEffect(() => {
    // Clear any existing timeout first
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }

    // Only set up autosave if dialog is open, there's meaningful content, and it's not editing an existing post
    if (isOpen && content.trim() && content.trim().length > 2 && !post) {
      // Only autosave if content has actually changed from last saved
      if (lastSavedContentRef.current !== content.trim()) {
        autosaveTimeoutRef.current = setTimeout(() => {
          saveDraft(false);
        }, 3000);
      }
    }

    // Cleanup function to clear timeout
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
    };
  }, [content, isOpen, post, saveDraft]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (showDrafts) {
          setShowDrafts(false);
        } else if (isOpenModal) {
          setIsOpenModal(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showDrafts, isOpenModal, onClose]);
  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setContent(post.content || "");
      setPrivacy(post.private ? "Only me" : "Public");

      if (post.attachments && Array.isArray(post.attachments)) {
        setAttachments(
          post.attachments.map((att) => ({
            file: null,
            url: att.fileUrl,
            id: att._id,
          }))
        );
      } else {
        setAttachments([]);
      }
    } else if (isOpen) {
      setTitle("");
      setContent("");
      setAttachments([]);
      setPrivacy("Public");
      // Reset the last saved content reference when creating a new post
      lastSavedContentRef.current = "";
    }

    // Clear autosave timeout when dialog closes
    if (!isOpen && autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
      lastSavedContentRef.current = "";
    }
  }, [post, isOpen]);

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // Filter out files that are too large and show an error for each
    const validFiles = [];
    imageFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `"${file.name}" is too big. Please keep each image under 3 MB.`
        );
      } else {
        validFiles.push(file);
      }
    });

    // Enforce max 4 attachments (including already attached)
    const availableSlots = 4 - attachments.length;
    if (availableSlots <= 0) {
      toast("You can upload up to 4 images only.");
      return;
    }

    const filesToAttach = validFiles.slice(0, availableSlots);

    if (filesToAttach.length < validFiles.length) {
      toast("You can upload up to 4 images only.");
    }

    const imagePreviews = filesToAttach.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...imagePreviews]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => {
      const updatedAttachments = [...prev];
      const removed = updatedAttachments.splice(index, 1)[0];

      if (removed.id) {
        setRemovedAttachments((prevRemoved) => [
          ...new Set([...prevRemoved, removed.id]),
        ]);
      }

      return updatedAttachments;
    });
  };

  const handleEmojiClick = (emojiObject) => {
    setContent((prev) => prev + emojiObject.emoji);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSubmit = () => {
    if (!content && attachments.length === 0) return;

    setIsSubmitting(true);

    const postData = {
      id: post?.id,
      title,
      content,
      attachments: attachments.map((att) => att.file || att.url),
      private: privacy === "Only me",
      removeAttachments: [...new Set(removedAttachments)],
    };

    if (!post) {
      removeDraftsByContent(content);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(postData);
      setAttachments([]);
      setRemovedAttachments([]);
      onClose();
    }, 1500);
  };

  const removeDraftsByContent = (contentToRemove) => {
    const updatedDrafts = drafts.filter(
      (d) => d.content.trim() !== contentToRemove.trim()
    );
    setDrafts(updatedDrafts);
    localStorage.setItem("postDrafts", JSON.stringify(updatedDrafts));
  };
  const loadDraft = (draft) => {
    setContent(draft.content);
    setAttachments(draft.attachments || []);
    if (draft.channel && draft.channel !== "Select Channel") {
      setSelectedOption(draft.channel);
    }

    // Reset the last saved content reference when loading a draft
    lastSavedContentRef.current = draft.content.trim();

    // Remove the draft from localStorage once it's loaded
    const updatedDrafts = drafts.filter((d) => d.id !== draft.id);
    setDrafts(updatedDrafts);
    localStorage.setItem("postDrafts", JSON.stringify(updatedDrafts));

    setShowDrafts(false);

    // Focus textarea after loading draft
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);

    // Notify the user that the draft was loaded and removed
    toast("Draft loaded successfully");
  };

  const deleteDraft = (e, draftId) => {
    e.stopPropagation();
    const updatedDrafts = drafts.filter((d) => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem("postDrafts", JSON.stringify(updatedDrafts));
    toast("Draft deleted");
  };

  const clearAllDrafts = () => {
    if (confirm("Are you sure you want to delete all drafts?")) {
      setDrafts([]);
      localStorage.removeItem("postDrafts");
      toast("All drafts deleted");
    }
  };

  const formatDraftDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getFilteredDrafts = () => {
    if (!searchDraft) return drafts;
    return drafts.filter((draft) =>
      draft.content.toLowerCase().includes(searchDraft.toLowerCase())
    );
  };

  const options = [
    { value: "Group", label: "Group", icon: <FaUsers /> },
    { value: "Feed", label: "Feed", icon: <FaNewspaper /> },
    { value: "Chat", label: "Chat", icon: <FaComments /> },
  ];

  const closeModal = () => {
    setIsOpenModal(false);
  };

  if (!isOpen) return null;

  const filteredDrafts = getFilteredDrafts();

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {showDrafts ? (
            <motion.div
              className={styles.draftsDialog}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.draftsHeader}>
                <motion.button
                  className={styles.draftsBackButton}
                  onClick={() => setShowDrafts(false)}
                  whileTap={{ scale: 0.95 }}
                >
                  <IoArrowBack />
                </motion.button>
                <span className={styles.draftsTitle}>Saved Drafts</span>

                {drafts.length > 0 && (
                  <motion.button
                    className={styles.draftsClearButton}
                    onClick={clearAllDrafts}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear All
                  </motion.button>
                )}
              </div>

              {drafts.length > 0 && (
                <div className={styles.searchBarContainer}>
                  <input
                    type="text"
                    placeholder="Search drafts..."
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                    className={styles.searchDrafts}
                  />
                </div>
              )}

              <div className={styles.draftsList}>
                {drafts.length === 0 ? (
                  <div className={styles.noDrafts}>
                    <MdOutlineNoteAdd size={40} />
                    <p>No saved drafts</p>
                    <motion.button
                      className={styles.newDraftBtn}
                      onClick={() => setShowDrafts(false)}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create a new post
                    </motion.button>
                  </div>
                ) : filteredDrafts.length === 0 ? (
                  <div className={styles.noDrafts}>
                    <p>No drafts match your search</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {filteredDrafts.map((draft) => (
                      <motion.div
                        key={draft.id}
                        className={styles.draftItem}
                        onClick={() => loadDraft(draft)}
                        whileHover={{ backgroundColor: "var(--secondary)" }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div>
                          <p className={styles.draftDate}>
                            <FaRegClock />
                            {formatDraftDate(draft.timestamp)}
                            {draft.channel !== "Select Channel" && (
                              <span>{draft.channel}</span>
                            )}
                          </p>
                          <p className={styles.draftContent}>{draft.content}</p>
                          {draft.attachments &&
                            draft.attachments.length > 0 && (
                              <div
                                className={styles.draftAttachmentInfo}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                <MdPhotoLibrary />
                                {draft.attachments.length}{" "}
                                {draft.attachments.length === 1
                                  ? "image"
                                  : "images"}
                              </div>
                            )}
                        </div>
                        <div className={styles.draftButtons}>
                          <button
                            className={`${styles.draftButton} ${styles.delete}`}
                            onClick={(e) => deleteDraft(e, draft.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              className={styles.dialog}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.header}>
                <button onClick={onClose} className={styles.closeButton}>
                  ×
                </button>
                <div
                  className={styles.drafts}
                  onClick={() => setShowDrafts(true)}
                >
                  <FaEdit />
                  <span>Drafts</span>
                  {drafts.length > 0 && (
                    <span className={styles.draftBadge}>{drafts.length}</span>
                  )}
                </div>
              </div>
              <div>
                <div className={styles.body}>
                  <div className={styles.profileSection}>
                    <label>Create post in</label>
                    <div className={styles.dropdownContainer}>
                      <div
                        className={styles.selectedOption}
                        onClick={() => setIsOpenModal(true)}
                      >
                        {options.find((opt) => opt.label === selectedOption)
                          ?.icon || null}
                        {selectedOption} <FaChevronDown />
                      </div>

                      <AnimatePresence>
                        {isOpenModal && (
                          <motion.div
                            className={styles.popupOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => setIsOpenModal(false)}
                          >
                            <motion.div
                              className={styles.popup}
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.95, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className={styles.popupHeader}>
                                <span>Select Channel</span>
                                <button
                                  className={styles.closeBtn}
                                  onClick={closeModal}
                                >
                                  ×
                                </button>
                              </div>
                              <div className={styles.popupOptions}>
                                {options.map((option) => (
                                  <div
                                    key={option.value}
                                    className={styles.option}
                                    onClick={() => {
                                      setSelectedOption(option.label);
                                      setIsOpenModal(false);
                                    }}
                                  >
                                    {option.icon} {option.label}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <textarea
                    ref={textareaRef}
                    placeholder="What do you want to share?"
                    className={styles.textarea}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={1800}
                  />

                  <AnimatePresence>
                    {attachments.length > 0 && (
                      <motion.div
                        className={styles.imagePreviewContainer}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {attachments.map((image, index) => (
                          <div key={index} className={styles.imagePreview}>
                            <img
                              src={image.url}
                              alt="Preview"
                              className={styles.previewImage}
                            />
                            <button
                              className={styles.removeButton}
                              onClick={() => handleRemoveAttachment(index)}
                            >
                              <IoClose />
                            </button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {content && (
                  <div className={styles.characterCount}>
                    {content.length}/1800
                  </div>
                )}

                <div className={styles.footer}>
                  <div className={styles.attachmentsButton}>
                    <div className={styles.emojiContainer}>
                      <button
                        className={styles.iconButton}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        aria-label="Insert emoji"
                      >
                        <FaRegSmile />
                      </button>
                      <AnimatePresence>
                        {showEmojiPicker && (
                          <motion.div
                            className={styles.emojiPicker}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                          >
                            <Picker onEmojiClick={handleEmojiClick} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <label
                      htmlFor="file-upload"
                      className={styles.iconButton}
                      aria-label="Add photos"
                    >
                      <MdPhotoLibrary />
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      className={styles.fileInput}
                      accept="image/*"
                      onChange={handleAttachmentChange}
                    />
                  </div>

                  <div className={styles.actionButtons}>
                    {!post && content.trim() && (
                      <button
                        onClick={() => saveDraft(true)}
                        className={styles.saveAsDraftBtn}
                      >
                        Save as draft
                      </button>
                    )}

                    <button
                      onClick={handleSubmit}
                      className={styles.postButton}
                      disabled={!content.trim() && attachments.length === 0}
                    >
                      {isSubmitting ? (
                        <>{post ? "Updating..." : "Posting..."}</>
                      ) : post ? (
                        "Update"
                      ) : (
                        "Post"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default PostDialog;
