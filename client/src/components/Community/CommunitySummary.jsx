import React from 'react';
import styles from './CommunitySummary.module.css';
import axios from "axios";

const SummaryContent = ({ profiles, onClick }) => {
  // Display up to 3 profile images

  // console.log(profiles)
  
  const totalCount = profiles.length;
  const visibleProfiles = profiles.slice(0, 3);
  const othersCount = totalCount > 3 ? totalCount - 3 : 0;
  
  return (
    <div className={styles.container} onClick={onClick}>
      <div className={styles.profileImages}>
        {visibleProfiles.map((profile, index) => (
          <div 
            key={profile._id} 
            className={styles.profileImageWrapper}
            style={{ zIndex: 3 - index }}
          >
            <img 
              src={profile.picture} 
              alt={profile.name} 
              className={styles.profileImage} 
            />
          </div>
        ))}
      </div>
      
      <div className={styles.text}>
         
        {
            othersCount>0
            &&
            ` + ${othersCount} Members`
        }
      </div>
    </div>
  );
};

// import LikesModal from './LikesModal';

const FollowersSummary = ({ profilesData, isLiked }) => {
  // State to store the likes profiles
//   console.log('234567890-')
//   console.log(profilesData)
  const [profiles, setProfiles] = React.useState(profilesData);
  const [showLikes, setShowLikes] = React.useState(false);


  

//   React.useEffect(() => {
//     // Fetch likes data when component mounts
//     axios
//       .get(`like/posts/${postId}`)
//       .then((res) => {
//         const resData = res.data.likes;
//         // Map over the likes, filtering out any null or undefined user objects
//         const profiles = resData
//           .map(like => like.user)
//           .filter(user => user !== null && user !== undefined); // Filter out null or undefined users
        
//         setProfiles(profiles); // Update the state with the valid profiles
//       })
//       .catch((err) => {
//         console.error('Error fetching likes:', err);
//       });
//   }, [isLiked]); // Dependency array includes postId

  return (
    <div>
      {/* {showLikes && <LikesModal profiles={profiles} onClose={() => setShowLikes(false)} />} */}
      <SummaryContent 
        profiles={profiles}
        onClick={() => setShowLikes(true)} 
      />
    </div>
  );
};

export default FollowersSummary;
