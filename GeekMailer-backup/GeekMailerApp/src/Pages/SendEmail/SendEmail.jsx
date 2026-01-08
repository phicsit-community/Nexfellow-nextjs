import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import SchedulingOptions from "../../Components/SchedulingOptions";
import RecipientsSelector from "../../Components/RecipientsSelector";
import { generateCronExpression } from "../../utils/cronUtils";
import FroalaEditor from "react-froala-wysiwyg";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/js/plugins.pkgd.min";
import "froala-editor/js/plugins/align.min.js";
import "froala-editor/js/plugins/colors.min.js";
import "froala-editor/js/plugins/draggable.min.js";
import "froala-editor/js/plugins/entities.min.js";
import "froala-editor/js/plugins/font_size.min.js";
import "froala-editor/js/plugins/help.min.js";
import "froala-editor/js/plugins/image.min.js";
import "froala-editor/js/plugins/link.min.js";
import "froala-editor/js/plugins/lists.min.js";
import "froala-editor/js/plugins/paragraph_format.min.js";
import "froala-editor/js/plugins/paragraph_style.min.js";
import "froala-editor/js/plugins/save.min.js";
import "froala-editor/js/plugins/table.min.js";
import "froala-editor/js/plugins/word_paste.min.js";
import styles from "./SendEmail.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
const SendEmail = () => {
  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [repeat, setRepeat] = useState("no");
  const [repeatOption, setRepeatOption] = useState("none");
  const [isScheduled, setIsScheduled] = useState(false);
  const [customFrequency, setCustomFrequency] = useState(1);
  const [customUnit, setCustomUnit] = useState("days");
  const [customDaysOfWeek, setCustomDaysOfWeek] = useState([]);
  const [customDayOfMonth, setCustomDayOfMonth] = useState(1);
  const [emailContent, setEmailContent] = useState("");
  const { user } = useSelector((state) => state.user);
  const adminId = user;

  const location = useLocation();
  const { state } = location;
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const now = new Date();
    const defaultDate = now.toISOString().split("T")[0];
    const defaultTime = new Date(now.getTime() + 2 * 60000)
      .toTimeString()
      .slice(0, 5);

    setDate(defaultDate);
    setTime(defaultTime);

    if (state) {
      setRecipients(state.recipients || []);
      setSubject(state.subject || "");
    }
  }, [state]);

  const handleModelChange = (content) => {
    setEmailContent(content);
  };

  const froalaEditorConfig = {
    attribution: false,
    height: 300,
    quickInsertEnabled: false,
    imageDefaultWidth: 0,
    imageResizeWithPercent: true,
    imageMultipleStyles: false,
    imageOutputSize: true,
    imageRoundPercent: true,
    imageMaxSize: 1024 * 1024 * 2.5,
    imageMove: true,
    imageDefaultDisplay: "inline",
    imageSplitHtml: true,
    imageEditButtons: [
      "imageReplace",
      "imageAlign",
      "imageRemove",
      "imageSize",
      "imageCaption",
      "-",
      "imageLink",
      "linkOpen",
      "linkEdit",
      "linkRemove",
    ],
    imageAllowedTypes: ["jpeg", "jpg", "png", "gif"],
    imageInsertButtons: ["imageBack", "|", "imageUpload"],
    placeholderText: "Your content goes here!",
    colorsStep: 5,
    colorsText: [
      "#000000",
      "#2C2E2F",
      "#6C7378",
      "#FFFFFF",
      "#009CDE",
      "#003087",
      "#FF9600",
      "#00CF92",
      "#DE0063",
      "#640487",
      "REMOVE",
    ],
    colorsBackground: [
      "#000000",
      "#2C2E2F",
      "#6C7378",
      "#FFFFFF",
      "#009CDE",
      "#003087",
      "#FF9600",
      "#00CF92",
      "#DE0063",
      "#640487",
      "REMOVE",
    ],
    toolbarButtons: {
      moreText: {
        buttons: [
          "paragraphFormat",
          "|",
          "fontSize",
          "textColor",
          "backgroundColor",
          "insertImage",
          "alignLeft",
          "alignRight",
          "alignJustify",
          "formatOL",
          "formatUL",
          "indent",
          "outdent",
        ],
        buttonsVisible: 6,
      },
      moreRich: {
        buttons: [
          "|",
          "bold",
          "italic",
          "underline",
          "insertHR",
          "insertLink",
          "insertTable",
        ],
        name: "additionals",
        buttonsVisible: 3,
      },
      dragnline: true,
      dummySection: {
        buttons: ["|"],
      },
      moreMisc: {
        buttons: ["|", "undo", "redo", "help", "|"],
        align: "right",
        buttonsVisible: 2,
      },
    },
    tableEditButtons: [
      "tableHeader",
      "tableRemove",
      "tableRows",
      "tableColumns",
      "tableStyle",
      "-",
      "tableCells",
      "tableCellBackground",
      "tableCellVerticalAlign",
      "tableCellHorizontalAlign",
    ],
    tableStyles: {
      grayTableBorder: "Gray Table Border",
      blackTableBorder: "Black Table Border",
      noTableBorder: "No Table Border",
    },
    toolbarSticky: true,
    pluginsEnabled: [
      "align",
      "colors",
      "draggable",
      "entities",
      "fontSize",
      "help",
      "image",
      "link",
      "lists",
      "paragraphFormat",
      "paragraphStyle",
      "save",
      "table",
      "wordPaste",
    ],
    events: {
      "image.beforeUpload": function (files) {
        const editor = this;
        if (files.length) {
          // Create a FormData object to handle file upload
          const formData = new FormData();
          formData.append("file", files[0]);

          // Upload the image to your server
          fetch(`${apiUrl}/upload-image`, {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              // Assuming the response contains the URL of the uploaded image
              const imageUrl = data.url; // e.g., "https://your-server.com/images/image1.jpg"

              console.log(imageUrl);
              // Insert the image with the absolute URL into the editor
              editor.image.insert(imageUrl, null, null, editor.image.get());
            })
            .catch((error) => {
              console.log(error);
              console.error("Image upload failed:", error);
            });

          // Prevent the default Froala upload
          return false;
        }
      },
      initialized: function () {
        const editor = this;
        editor.events.on("mousedown", function (e) {
          if (e.target.tagName === "IMG") {
            e.target.setAttribute("draggable", true);
          }
        });
      },
      contentChanged: function () {
        const editor = this;
        setEmailContent(editor.html.get());
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedDate = date || new Date().toISOString().split("T")[0];
      const selectedTime =
        time || new Date(Date.now() + 2 * 60000).toTimeString().slice(0, 5);

      const cronExpression = generateCronExpression({
        customUnit,
        customFrequency,
        customDaysOfWeek,
        customDayOfMonth,
        repeatOption,
        date: selectedDate,
        time: selectedTime,
      });

      let status = "";

      if (isScheduled) {
        status = repeatOption === "repeat" ? "repeat" : "scheduled";
      }

      const emailData = {
        adminId,
        to: recipients.map((recipient) => recipient.value),
        subject,
        text: emailContent, // Use the Froala editor content
        schedule: isScheduled ? cronExpression : null,
        status: status,
      };

      const endpoint = isScheduled
        ? "/emails/schedule"
        : "/emails/send-immediate";
      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        alert("Email submitted successfully");
      } else {
        alert("Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const navigate = useNavigate();
  const goback = () => {
    console.log("button clicking");
    navigate(-1);
  };

  // return (
  //   <div className="min-h-screen bg-container">
  //     <div className={Style.back}>
  //       <FontAwesomeIcon icon={faArrowLeft} />
  //       <h4>Back</h4>
  //     </div>
  //     <div className="container mx-auto md:p-4 w-full md:w-[70vw]">
  //       <form
  //         onSubmit={handleSubmit}
  //         className="bg-form shadow-form rounded-form p-form space-y-2 text-sm"
  //       >
  //         <RecipientsSelector
  //           recipients={recipients}
  //           setRecipients={setRecipients}
  //         />
  //         <div className="space-y-2">
  //           <label className="block text-large font-medium text-gradient">
  //             Subject:
  //           </label>
  //           <input
  //             type="text"
  //             value={subject}
  //             onChange={(e) => setSubject(e.target.value)}
  //             className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
  //             placeholder="Enter email subject"
  //             required
  //           />
  //         </div>

  //         {/* Froala Email Content Editor */}
  //         <div className="space-y-2">
  //           <label className="block text-large font-medium text-gradient">
  //             Email Content:
  //           </label>
  //           <FroalaEditor config={froalaEditorConfig} />
  //         </div>

  //         <SchedulingOptions
  //           isScheduled={isScheduled}
  //           setIsScheduled={setIsScheduled}
  //           repeat={repeat}
  //           setRepeat={setRepeat}
  //           repeatOption={repeatOption}
  //           setRepeatOption={setRepeatOption}
  //           customFrequency={customFrequency}
  //           setCustomFrequency={setCustomFrequency}
  //           customUnit={customUnit}
  //           setCustomUnit={setCustomUnit}
  //           customDaysOfWeek={customDaysOfWeek}
  //           setCustomDaysOfWeek={setCustomDaysOfWeek}
  //           customDayOfMonth={customDayOfMonth}
  //           setCustomDayOfMonth={setCustomDayOfMonth}
  //           date={date}
  //           setDate={setDate}
  //           time={time}
  //           setTime={setTime}
  //         />

  //         <div className="flex space-x-4">
  //           <button
  //             type="submit"
  //             className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:outline-none"
  //           >
  //             Send Email
  //           </button>
  //         </div>
  //       </form>
  //     </div>
  //   </div>
  // );

  return (
    <div className={styles.minHScreen}>
      <div onClick={goback} className={styles.backBttn}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <button>Back</button>
      </div>

      <div className={`${styles.container} ${styles.containerMd}`}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <RecipientsSelector
            recipients={recipients}
            setRecipients={setRecipients}
          />
          <div className={styles.spaceY2}>
            <label className={styles.label}>Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={styles.input}
              placeholder="Enter email subject"
              required
            />
          </div>

          {/* Froala Email Content Editor */}
          <div className={styles.spaceY2}>
            <label className={styles.label}>Email Content:</label>
            <FroalaEditor config={froalaEditorConfig} />
          </div>

          <SchedulingOptions
            isScheduled={isScheduled}
            setIsScheduled={setIsScheduled}
            repeat={repeat}
            setRepeat={setRepeat}
            repeatOption={repeatOption}
            setRepeatOption={setRepeatOption}
            customFrequency={customFrequency}
            setCustomFrequency={setCustomFrequency}
            customUnit={customUnit}
            setCustomUnit={setCustomUnit}
            customDaysOfWeek={customDaysOfWeek}
            setCustomDaysOfWeek={setCustomDaysOfWeek}
            customDayOfMonth={customDayOfMonth}
            setCustomDayOfMonth={setCustomDayOfMonth}
            date={date}
            setDate={setDate}
            time={time}
            setTime={setTime}
          />

          <div className={styles.spaceX4}>
            <button type="submit" className={styles.button}>
              Send Email{" "}
              <FontAwesomeIcon
                icon={faPaperPlane}
                style={{ color: "#ffffff" }}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendEmail;
