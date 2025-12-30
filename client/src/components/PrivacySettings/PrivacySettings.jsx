import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import styles from "./PrivacySettings.module.css";
import { Switch } from "../../components/ui/switch";

const PrivacySettings = () => {
  const [settings, setSettings] = useState({
    showEmail: true,
    showFollowers: true,
    showFollowing: true,
    showRegisteredQuizzes: true,
    showJoinedChallenges: true,
    allowDirectMessages: true,
    allowMentions: true,
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState({});

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/user/privacy-settings");
      if (response.data && response.data.privacySettings) {
        setSettings(response.data.privacySettings);
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
      toast.error("Failed to load privacy settings", { richColors: true });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    try {
      // Set this specific setting as saving
      setSavingSettings((prev) => ({ ...prev, [key]: true }));

      // Update local state immediately for responsive UI
      const newValue = !settings[key];
      setSettings((prev) => ({ ...prev, [key]: newValue }));

      // Send the update to the server
      await axios.patch("/user/privacy-settings", {
        privacySettings: { [key]: newValue },
      });

      // Show success toast
      // Format the key into a readable name
      const settingName = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .replace(/([a-z])([A-Z])/g, "$1 $2");
      toast.success(`${settingName} updated successfully`, {
        richColors: true,
      });
    } catch (error) {
      // Revert the change if there was an error
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
      console.error("Error saving privacy setting:", error);
      toast.error("Failed to update setting", { richColors: true });
    } finally {
      // Clear the saving state for this setting
      setSavingSettings((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingMessage}>Loading privacy settings...</div>
    );
  }

  return (
    <div className={styles.privacySettings}>
      <h2 className={styles.sectionTitle}>Privacy Settings</h2>
      <p className={styles.sectionDescription}>
        Control what information is visible to other users and how others can
        interact with you. Changes will be saved automatically.
      </p>

      <div className={styles.settingsGroup}>
        <h3 className={styles.groupTitle}>Profile Visibility</h3>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <h4>Show Email</h4>
            <p>Allow others to see your email address</p>
          </div>
          <Switch
            checked={settings.showEmail}
            onCheckedChange={() => handleToggle("showEmail")}
            id="show-email"
            disabled={savingSettings.showEmail}
          />
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <h4>Show Followers</h4>
            <p>Allow others to see who follows you</p>
          </div>
          <Switch
            checked={settings.showFollowers}
            onCheckedChange={() => handleToggle("showFollowers")}
            id="show-followers"
            disabled={savingSettings.showFollowers}
          />
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <h4>Show Following</h4>
            <p>Allow others to see who you follow</p>
          </div>
          <Switch
            checked={settings.showFollowing}
            onCheckedChange={() => handleToggle("showFollowing")}
            id="show-following"
            disabled={savingSettings.showFollowing}
          />
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <h4>Show Registered Quizzes</h4>
            <p>Allow others to see quizzes you&apos;ve registered for</p>
          </div>
          <Switch
            checked={settings.showRegisteredQuizzes}
            onCheckedChange={() => handleToggle("showRegisteredQuizzes")}
            id="show-quizzes"
            disabled={savingSettings.showRegisteredQuizzes}
          />
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <h4>Show Joined Challenges</h4>
            <p>Allow others to see challenges you&apos;ve joined</p>
          </div>
          <Switch
            checked={settings.showJoinedChallenges}
            onCheckedChange={() => handleToggle("showJoinedChallenges")}
            id="show-challenges"
            disabled={savingSettings.showJoinedChallenges}
          />
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h3 className={styles.groupTitle}>Communication</h3>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <h4>Allow Direct Messages</h4>
            <p>Allow other users to send you direct messages</p>
          </div>
          <Switch
            checked={settings.allowDirectMessages}
            onCheckedChange={() => handleToggle("allowDirectMessages")}
            id="allow-messages"
            disabled={savingSettings.allowDirectMessages}
          />
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <h4>Allow Mentions</h4>
            <p>Allow other users to mention you in posts and comments</p>
          </div>
          <Switch
            checked={settings.allowMentions}
            onCheckedChange={() => handleToggle("allowMentions")}
            id="allow-mentions"
            disabled={savingSettings.allowMentions}
          />
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
