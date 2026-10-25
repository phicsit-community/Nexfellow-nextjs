import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import Picker from "emoji-picker-react";
import {
  FaRegSmile,
  FaUsers,
  FaNewspaper,
  FaChevronDown,
  FaTrash,
  FaRegClock,
} from "react-icons/fa";
import { MdPhotoLibrary, MdOutlineNoteAdd, MdVideoLibrary } from "react-icons/md";
import { TbBox } from "react-icons/tb";
import { IoClose, IoArrowBack } from "react-icons/io5";
import styles from "./PostDialog.module.css";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/axios";
import {
  saveDraftFiles,
  loadDraftFiles,
  deleteDraftFiles,
  pruneDraftFiles,
} from "../../utils/postDraftFiles";

const DRAFTS_KEY = "postDrafts";
const MAX_DRAFTS = 20;
const MIN_DRAFT_TEXT_LENGTH = 3;

// A draft is worth keeping if it has some real text or any attachment (image-only posts are valid)
const hasDraftableContent = (text, attachments) =>
  text.trim().length >= MIN_DRAFT_TEXT_LENGTH || attachments.length > 0;

// Identifies what's in the editor so unchanged content isn't saved again
const getDraftSignature = (text, attachments, channel) =>
  JSON.stringify([text.trim(), channel, attachments.map((att) => att.url)]);

const formatAttachmentCount = (attachments) => {
  const videos = attachments.filter((att) => att.type === "video").length;
  const images = attachments.length - videos;
  return [
    images && `${images} ${images === 1 ? "image" : "images"}`,
    videos && `${videos} ${videos === 1 ? "video" : "videos"}`,
  ]
    .filter(Boolean)
    .join(", ");
};

const readStoredDrafts = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(DRAFTS_KEY) || "[]");
    if (!Array.isArray(stored)) return [];
    // Older drafts stored attachments as { file, url } with a blob: URL that's dead after a
    // reload and a File that JSON turned into {}; they can't be restored, so drop them
    return stored.map((draft) => ({
      ...draft,
      content: draft.content || "",
      attachments: (draft.attachments || []).filter((att) => !att.url),
    }));
  } catch (e) {
    console.error("Error parsing drafts from localStorage:", e);
    return [];
  }
};

// Mirrors backend/constants/plans.js postCharLimit for display purposes only.
// The backend is the source of truth and enforces the real limit.
const POST_CHAR_LIMITS = {
  free: 500,
  builder_pro: 2000,
  founder: 5000,
};

// Mirrors backend/constants/plans.js imagesPerPost (backend counts every attachment).
const POST_ATTACHMENT_LIMITS = {
  free: 1,
  builder_pro: 2,
  founder: 4,
};

const getEffectiveTier = (user) => {
  if (!user || !POST_CHAR_LIMITS[user.subscriptionTier]) return "free";
  if (
    user.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) < new Date()
  ) {
    return "free";
  }
  return user.subscriptionTier;
};

const getPostCharLimit = (user) => POST_CHAR_LIMITS[getEffectiveTier(user)];
const getAttachmentLimit = (user) =>
  POST_ATTACHMENT_LIMITS[getEffectiveTier(user)];

const PostDialog = ({ isOpen, onClose, onSubmit, post }) => {
  const user = useSelector((state) => state.auth.user);
  const charLimit = getPostCharLimit(user);
  const attachmentLimit = getAttachmentLimit(user);
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [privacy, setPrivacy] = useState("Public");
  const [removedAttachments, setRemovedAttachments] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("General Feed");
  const [selectedCommunityId, setSelectedCommunityId] = useState("general");
  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [searchDraft, setSearchDraft] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [attachedProduct, setAttachedProduct] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const textareaRef = useRef(null);
  const videoInputRef = useRef(null);
  const autosaveTimeoutRef = useRef(null);
  const lastSavedSignatureRef = useRef(null);
  // The draft this compose session writes to, so edits update one draft instead of adding more
  const draftIdRef = useRef(null);
  // Drafts posted or deleted while a save was in flight, so that save doesn't bring them back
  const discardedDraftIdsRef = useRef(new Set());
  const MAX_FILE_SIZE = 3 * 1024 * 1024;
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

  useEffect(() => {
    const storedDrafts = readStoredDrafts();
    setDrafts(storedDrafts);
    pruneDraftFiles(storedDrafts.map((d) => d.id)).catch((e) =>
      console.error("Error pruning draft attachments:", e)
    );
  }, []);

  // localStorage is the source of truth so a save that finishes after the dialog closes still lands
  const updateStoredDrafts = useCallback((update) => {
    const updatedDrafts = update(readStoredDrafts());
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
  }, []);

  useEffect(() => {
    if (isOpen && textareaRef.current && !post && !content) {
      setTimeout(() => {
        textareaRef.current.focus();
      }, 300);
    }
  }, [isOpen, post, content]);

  const saveDraft = useCallback(
    async (showToast = true) => {
      // Drafts are only for new posts, not edits of a published one
      if (post || !hasDraftableContent(content, attachments)) return;

      const signature = getDraftSignature(content, attachments, selectedOption);
      if (lastSavedSignatureRef.current === signature) {
        // Autosave got there first; still confirm a manual "Save as draft"
        if (showToast) toast("Draft saved");
        return;
      }
      lastSavedSignatureRef.current = signature;

      const draftId = draftIdRef.current || Date.now().toString();
      draftIdRef.current = draftId;
      const trimmedContent = content.trim();

      let savedAttachments = attachments;
      try {
        if (attachments.length > 0) {
          await saveDraftFiles(
            draftId,
            attachments.map(({ file, type }) => ({ file, type }))
          );
        } else {
          await deleteDraftFiles(draftId);
        }
      } catch (e) {
        console.error("Error saving draft attachments:", e);
        if (!trimmedContent) {
          lastSavedSignatureRef.current = null;
          toast.error("Couldn't save your draft. Please try again.");
          return;
        }
        savedAttachments = [];
        toast("Draft saved without its attachments");
      }

      if (discardedDraftIdsRef.current.has(draftId)) {
        deleteDraftFiles(draftId).catch(() => {});
        return;
      }

      const draft = {
        id: draftId,
        content: trimmedContent,
        attachments: savedAttachments.map(({ type }) => ({ type })),
        timestamp: new Date().toISOString(),
        channel: selectedOption !== "Select Channel" ? selectedOption : "Feed",
      };

      let isNewDraft = false;
      updateStoredDrafts((currentDrafts) => {
        isNewDraft = !currentDrafts.some((d) => d.id === draftId);
        return isNewDraft
          ? [draft, ...currentDrafts].slice(0, MAX_DRAFTS)
          : currentDrafts.map((d) => (d.id === draftId ? draft : d));
      });

      if (isNewDraft) toast("Draft saved");
      else if (showToast) toast("Draft updated");
    },
    [post, content, attachments, selectedOption, updateStoredDrafts]
  );

  useEffect(() => {
    // Clear any existing timeout first
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }

    // Autosave new posts once the text, attachments or channel settle
    if (
      isOpen &&
      !post &&
      hasDraftableContent(content, attachments) &&
      lastSavedSignatureRef.current !==
        getDraftSignature(content, attachments, selectedOption)
    ) {
      autosaveTimeoutRef.current = setTimeout(() => {
        saveDraft(false);
      }, 3000);
    }

    // Cleanup function to clear timeout
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
    };
  }, [content, attachments, selectedOption, isOpen, post, saveDraft]);

  // Closing must not drop changes made since the last autosave (or before the first one)
  const handleClose = useCallback(() => {
    saveDraft(false);
    onClose();
  }, [saveDraft, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (showDrafts) {
          setShowDrafts(false);
        } else if (showProductPicker) {
          setShowProductPicker(false);
        } else if (isOpenModal) {
          setIsOpenModal(false);
        } else {
          handleClose();
        }
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, showDrafts, showProductPicker, isOpenModal, handleClose]);
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
            type: att.fileType?.startsWith("video/") ? "video" : "image",
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
    }

    // Each time the dialog opens or closes, the next new post starts a fresh draft
    // (handleClose has already saved anything pending before this runs)
    draftIdRef.current = null;
    lastSavedSignatureRef.current = null;
    if (!isOpen && autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
      autosaveTimeoutRef.current = null;
    }

    // Reset community selection on close
    if (!isOpen) {
      setSelectedCommunityId("general");
      setSelectedOption("General Feed");
      setAttachedProduct(null);
      setShowProductPicker(false);
      setProductSearch("");
    }
  }, [post, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCommunities = async () => {
      setCommunitiesLoading(true);
      try {
        const res = await api.get("/user/moderated-communities");
        setCommunities(res.data || []);
      } catch {
        setCommunities([]);
      } finally {
        setCommunitiesLoading(false);
      }
    };
    fetchCommunities();
  }, [isOpen]);

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const validFiles = [];
    imageFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" is too big. Please keep each image under 3 MB.`);
      } else {
        validFiles.push(file);
      }
    });

    const limitMessage = `Your plan allows up to ${attachmentLimit} attachment${
      attachmentLimit === 1 ? "" : "s"
    } per post.`;
    const availableSlots = attachmentLimit - attachments.length;
    if (availableSlots <= 0) {
      toast(limitMessage);
      return;
    }

    const filesToAttach = validFiles.slice(0, availableSlots);
    if (filesToAttach.length < validFiles.length) {
      toast(limitMessage);
    }

    const imagePreviews = filesToAttach.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: "image",
    }));

    setAttachments((prev) => [...prev, ...imagePreviews]);
    e.target.value = "";
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error(`"${file.name}" is too large. Please keep videos under 50 MB.`);
      e.target.value = "";
      return;
    }

    const hasVideo = attachments.some((a) => a.type === "video");
    if (hasVideo) {
      toast("You can only attach one video per post.");
      e.target.value = "";
      return;
    }

    if (attachments.length >= attachmentLimit) {
      toast(
        `Your plan allows up to ${attachmentLimit} attachment${
          attachmentLimit === 1 ? "" : "s"
        } per post.`
      );
      e.target.value = "";
      return;
    }

    setAttachments((prev) => [
      ...prev,
      { file, url: URL.createObjectURL(file), type: "video" },
    ]);
    e.target.value = "";
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

  const handleSubmit = async () => {
    if (!content && attachments.length === 0) return;
    if (!post && !selectedCommunityId) return;

    setIsSubmitting(true);

    const postData = {
      editingPostId: post?._id || null,
      postCommunityId: post?.community?._id || null,
      title,
      content,
      attachments: attachments.map((att) => att.file || att.url),
      private: privacy === "Only me",
      removeAttachments: [...new Set(removedAttachments)],
      communityId: selectedCommunityId,
      ...(attachedProduct && { productId: attachedProduct._id }),
    };

    try {
      await onSubmit(postData);
      // Only drop the draft once the post went through, so a failed post can still be saved
      if (!post) discardCurrentDraft();
      setAttachments([]);
      setRemovedAttachments([]);
      setAttachedProduct(null);
      onClose();
    } catch {
      // error toast already shown by onSubmit — stay open so user can retry
    } finally {
      setIsSubmitting(false);
    }
  };

  // Removes a draft and its stored files; a save still in flight for it is dropped too
  const removeDraft = (draftId) => {
    discardedDraftIdsRef.current.add(draftId);
    updateStoredDrafts((currentDrafts) =>
      currentDrafts.filter((d) => d.id !== draftId)
    );
    deleteDraftFiles(draftId).catch((e) =>
      console.error("Error deleting draft attachments:", e)
    );
    if (draftIdRef.current === draftId) draftIdRef.current = null;
  };

  const discardCurrentDraft = () => {
    if (draftIdRef.current) removeDraft(draftIdRef.current);
  };

  const loadDraft = async (draft) => {
    // Keep whatever is in the editor before replacing it
    await saveDraft(false);

    let storedFiles = [];
    if (draft.attachments.length > 0) {
      try {
        storedFiles = await loadDraftFiles(draft.id);
      } catch (e) {
        console.error("Error loading draft attachments:", e);
      }
      if (storedFiles.length < draft.attachments.length) {
        toast("Some attachments in this draft couldn't be restored");
      }
    }
    const restoredAttachments = storedFiles.map(({ file, type }) => ({
      file,
      type,
      url: URL.createObjectURL(file),
    }));

    const channel =
      draft.channel && draft.channel !== "Select Channel"
        ? draft.channel
        : selectedOption;

    setContent(draft.content);
    setAttachments(restoredAttachments);
    setSelectedOption(channel);

    // Keep editing the same draft; it stays in the list until it's posted or deleted
    draftIdRef.current = draft.id;
    lastSavedSignatureRef.current = getDraftSignature(
      draft.content,
      restoredAttachments,
      channel
    );

    setShowDrafts(false);

    // Focus textarea after loading draft
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);

    toast("Draft loaded successfully");
  };

  const deleteDraft = (e, draftId) => {
    e.stopPropagation();
    removeDraft(draftId);
    toast("Draft deleted");
  };

  const clearAllDrafts = () => {
    if (confirm("Are you sure you want to delete all drafts?")) {
      drafts.forEach((d) => discardedDraftIdsRef.current.add(d.id));
      updateStoredDrafts(() => []);
      pruneDraftFiles([]).catch((e) =>
        console.error("Error deleting draft attachments:", e)
      );
      draftIdRef.current = null;
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

  const GENERAL_FEED_OPTION = {
    value: "general",
    label: "General Feed",
    icon: <FaNewspaper />,
  };

  const options = [
    GENERAL_FEED_OPTION,
    ...communities.map((c) => ({
      value: c._id,
      label: c.name,
      icon: c.profileImage ? (
        <img src={c.profileImage} alt={c.name} style={{ width: 16, height: 16, borderRadius: "50%", objectFit: "cover" }} />
      ) : (
        <FaUsers />
      ),
    })),
  ];

  const closeModal = () => {
    setIsOpenModal(false);
  };

  const handleOpenProductPicker = async () => {
    setShowProductPicker(true);
    if (products.length > 0) return;
    setProductsLoading(true);
    try {
      const res = await api.get("/products/my");
      setProducts(res.data.products || res.data || []);
    } catch {
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
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
                          <p
                            className={`${styles.draftContent} ${
                              draft.content ? "" : styles.draftContentEmpty
                            }`}
                          >
                            {draft.content || "No text"}
                          </p>
                          {draft.attachments.length > 0 && (
                            <div
                              className={styles.draftAttachmentInfo}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <MdPhotoLibrary />
                              {formatAttachmentCount(draft.attachments)}
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
                <button onClick={handleClose} className={styles.closeButton}>
                  <IoClose />
                </button>
                <div
                  className={styles.drafts}
                  onClick={() => setShowDrafts(true)}
                >
                  <span>Drafts</span>
                  {drafts.length > 0 && (
                    <span className={styles.draftBadge}>{drafts.length}</span>
                  )}
                </div>
              </div>
              <div>
                <div className={styles.body}>
                  <div className={styles.profileSection}>
                    <div className={styles.userAvatar}>
                      {user?.picture ? (
                        <img src={user.picture} alt={user.name} className={styles.avatarImage} />
                      ) : (
                        <span className={styles.avatarFallback}>{user?.name?.charAt(0) || "U"}</span>
                      )}
                    </div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{user?.name || "Your Name"}</span>
                      <div className={styles.dropdownContainer}>
                        <div
                          className={styles.audienceBtn}
                          onClick={() => !communitiesLoading && setIsOpenModal(true)}
                        >
                          {options.find((opt) => opt.value === selectedCommunityId)?.icon || null}
                          <span>{communitiesLoading ? "Loading..." : selectedOption}</span>
                          <FaChevronDown />
                        </div>
                      </div>
                    </div>
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
                            <span>Select Community</span>
                            <button className={styles.closeBtn} onClick={closeModal}>
                              ×
                            </button>
                          </div>
                          <div className={styles.popupOptions}>
                            {options.length === 0 ? (
                              <div className={styles.option} style={{ color: "var(--muted)", cursor: "default" }}>
                                No communities found
                              </div>
                            ) : (
                              options.map((option) => (
                                <div
                                  key={option.value}
                                  className={styles.option}
                                  onClick={() => {
                                    setSelectedOption(option.label);
                                    setSelectedCommunityId(option.value);
                                    setIsOpenModal(false);
                                  }}
                                >
                                  {option.icon} {option.label}
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {showProductPicker && (
                      <motion.div
                        className={styles.productPickerPanel}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className={styles.productPickerHeader}>
                          <div className={styles.productPickerTitleRow}>
                            <TbBox size={17} />
                            <span>Attach a Product</span>
                          </div>
                          <button
                            className={styles.productPickerClose}
                            onClick={() => { setShowProductPicker(false); setProductSearch(""); }}
                            type="button"
                          >
                            <IoClose />
                          </button>
                        </div>

                        {!productsLoading && products.length > 3 && (
                          <div className={styles.productPickerSearch}>
                            <input
                              type="text"
                              placeholder="Search products…"
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                        )}

                        <div className={styles.productPickerList}>
                          {productsLoading ? (
                            <div className={styles.productPickerEmpty}>
                              <div className={styles.productPickerSpinner} />
                              <span>Loading products…</span>
                            </div>
                          ) : products.length === 0 ? (
                            <div className={styles.productPickerEmpty}>
                              <TbBox size={32} />
                              <span>No products yet. Add one in My Products.</span>
                            </div>
                          ) : (() => {
                            const filtered = products.filter((p) =>
                              !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.tagline || "").toLowerCase().includes(productSearch.toLowerCase())
                            );
                            return filtered.length === 0 ? (
                              <div className={styles.productPickerEmpty}>
                                <span>No products match "{productSearch}"</span>
                              </div>
                            ) : filtered.map((product) => {
                              const logoSrc = product.logoUrl
                                || (typeof product.logo === "string" ? product.logo : product.logo?.url)
                                || null;
                              const isSelected = attachedProduct?._id === product._id;
                              return (
                                <div
                                  key={product._id}
                                  className={`${styles.productItem} ${isSelected ? styles.productItemSelected : ""}`}
                                  onClick={() => {
                                    setAttachedProduct(isSelected ? null : product);
                                    setShowProductPicker(false);
                                    setProductSearch("");
                                  }}
                                >
                                  <div className={styles.productItemLogo}>
                                    {logoSrc ? (
                                      <img src={logoSrc} alt={product.name} />
                                    ) : (
                                      <TbBox size={18} />
                                    )}
                                  </div>
                                  <div className={styles.productItemInfo}>
                                    <span className={styles.productItemName}>{product.name}</span>
                                    {product.tagline && (
                                      <span className={styles.productItemTagline}>{product.tagline}</span>
                                    )}
                                  </div>
                                  {isSelected ? (
                                    <span className={styles.productItemCheck}>✓</span>
                                  ) : (
                                    <span className={styles.productItemAttachHint}>Attach</span>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <textarea
                    ref={textareaRef}
                    placeholder="What do you want to share?"
                    className={styles.textarea}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={charLimit}
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
                        {attachments.map((attachment, index) => (
                          <div key={index} className={styles.imagePreview}>
                            {attachment.type === "video" ? (
                              <video
                                src={attachment.url}
                                className={styles.previewImage}
                                controls
                                muted
                              />
                            ) : (
                              <img
                                src={attachment.url}
                                alt="Preview"
                                className={styles.previewImage}
                              />
                            )}
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
                  <AnimatePresence>
                    {attachedProduct && (
                      <motion.div
                        className={styles.attachedProductCard}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                      >
                        {(() => {
                          const logoSrc = attachedProduct.logoUrl
                            || (typeof attachedProduct.logo === "string" ? attachedProduct.logo : attachedProduct.logo?.url)
                            || null;
                          return (
                            <>
                              <div className={styles.attachedProductLogo}>
                                {logoSrc ? (
                                  <img src={logoSrc} alt={attachedProduct.name} />
                                ) : (
                                  <TbBox size={22} />
                                )}
                              </div>
                              <div className={styles.attachedProductInfo}>
                                <span className={styles.attachedProductLabel}>Attached product</span>
                                <span className={styles.attachedProductName}>{attachedProduct.name}</span>
                                {attachedProduct.tagline && (
                                  <span className={styles.attachedProductTagline}>{attachedProduct.tagline}</span>
                                )}
                              </div>
                              <button
                                className={styles.attachedProductRemove}
                                onClick={() => setAttachedProduct(null)}
                                aria-label="Remove attached product"
                                type="button"
                              >
                                <IoClose />
                              </button>
                            </>
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className={styles.footer}>
                  <div className={styles.attachmentsButton}>
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

                    <label
                      htmlFor="video-upload"
                      className={styles.iconButton}
                      aria-label="Add video"
                    >
                      <MdVideoLibrary />
                    </label>
                    <input
                      id="video-upload"
                      ref={videoInputRef}
                      type="file"
                      className={styles.fileInput}
                      accept="video/*"
                      onChange={handleVideoChange}
                    />

                    <button
                      className={`${styles.iconButton} ${attachedProduct ? styles.iconButtonActive : ""}`}
                      aria-label="Attach product"
                      type="button"
                      onClick={handleOpenProductPicker}
                    >
                      <TbBox />
                    </button>

                    <div className={styles.emojiContainer}>
                      <button
                        className={styles.iconButton}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        aria-label="Insert emoji"
                        type="button"
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
                            <Picker onEmojiClick={handleEmojiClick} theme={isDark ? "dark" : "light"} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className={styles.actionButtons}>
                    {!post && hasDraftableContent(content, attachments) && (
                      <button
                        onClick={() => saveDraft(true)}
                        className={styles.saveAsDraftBtn}
                      >
                        Save as draft
                      </button>
                    )}

                    {content.length > 0 && (() => {
                      const MAX = charLimit;
                      const pct = content.length / MAX;
                      const r = 14;
                      const circ = 2 * Math.PI * r;
                      const offset = circ - pct * circ;
                      const color = pct >= 1 ? '#ff4d4f' : pct >= 0.85 ? '#faad14' : 'var(--color-primary)';
                      const showCount = pct >= 0.75;
                      const remaining = MAX - content.length;
                      return (
                        <svg
                          width="34"
                          height="34"
                          viewBox="0 0 34 34"
                          className={styles.charCircle}
                          aria-label={`${remaining} characters remaining`}
                        >
                          <circle cx="17" cy="17" r={r} fill="none" stroke="#e0e0e0" strokeWidth="2.5" className={styles.charCircleTrack} />
                          <circle
                            cx="17" cy="17" r={r}
                            fill="none"
                            stroke={color}
                            strokeWidth="2.5"
                            strokeDasharray={circ}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            transform="rotate(-90 17 17)"
                            style={{ transition: 'stroke-dashoffset 0.15s ease, stroke 0.15s ease' }}
                          />
                          {showCount && (
                            <text
                              x="17" y="21"
                              textAnchor="middle"
                              fontSize="8"
                              fontWeight="600"
                              fill={color}
                            >
                              {remaining < 0 ? `-${Math.abs(remaining)}` : remaining}
                            </text>
                          )}
                        </svg>
                      );
                    })()}

                    {isSubmitting && <div className={styles.spinner} />}

                    <button
                      onClick={handleSubmit}
                      className={styles.postButton}
                      disabled={
                        (!content.trim() && attachments.length === 0) ||
                        (!post && !selectedCommunityId) ||
                        isSubmitting ||
                        content.length > charLimit
                      }
                    >
                      {post ? "Update" : "Post"}
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
