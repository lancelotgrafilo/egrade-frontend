import { useContext, useEffect, useState } from 'react';
import styleDashboardRegistrar from './dashboard.module.css';
import cert from '../../../assets/icons/cert.png';
import tor from '../../../assets/icons/tor.png';
import arrowB from '../../../assets/icons/arrowB.png';
import arrowG from '../../../assets/icons/arrowG.png';
import verifiedIcon from '../../../assets/icons/verified.png';
import { useNavigate } from 'react-router-dom';
import { ActiveButtonContext } from '../../../utils/contexts/ActiveButtonContext';
import { jwtDecode } from 'jwt-decode';
import { useAnnouncements } from '../../../utils/hooks/announcementHooks/useAnnouncement';
import useGetFacultyDetails from '../../../utils/hooks/facultyStaffHooks/useGetFacultyDetails';

export function DashboardRegistrar() {
  const navigate = useNavigate();
  const { updateActiveButton } = useContext(ActiveButtonContext);
  const { announcements } = useAnnouncements();

  const handleNavigation = (path, btnId) => {
    updateActiveButton(btnId);
    navigate(path);
  };

  const token = localStorage.getItem('token');
  let userId = '';
  let userName = '';

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
      userName = decodedToken.first_name || 'User';
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }

  const { userDetails, loading, error } = useGetFacultyDetails(userId);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (userDetails?.load) {
      const hours = new Date().getHours();
      setGreeting(hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening');
    }
  }, [userDetails]);

  const filteredAnnouncements = announcements.filter(announcement => announcement.instructorID === userId);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading dashboard data</p>;

  return (
    <div className={styleDashboardRegistrar.mainContainer}>
      <div className={styleDashboardRegistrar.greetingCard}>
        <h2>{greeting}, {userDetails?.first_name || userName}!</h2>
        <p>Welcome to your dashboard.</p>
      </div>

      {userDetails?.isVerified ? (
        <div className={styleDashboardRegistrar.verifiedMessage}>
          <p>
            <img src={verifiedIcon} alt="Verified" className={styleDashboardRegistrar.verifiedIcon} />
            Your account is verified.
          </p>
        </div>
      ) : (
        <div className={styleDashboardRegistrar.verificationMessage}>
          <p>Please verify your account in settings to access all features.</p>
        </div>
      )}

      <div className={styleDashboardRegistrar.announcementCard}>
        <h3>Announcement</h3>
        {filteredAnnouncements.length > 0 ? (
          <ul>
            {filteredAnnouncements.map((announcement, index) => (
              <li key={index} className={styleDashboardRegistrar.announcementBullet}>
                <p className={styleDashboardRegistrar.announcementMessage}>
                  {announcement.message}
                </p>
                {announcement.dueDate && (
                  <p className={styleDashboardRegistrar.announcementDueDate}>
                    Due Date: {new Date(announcement.dueDate).toLocaleDateString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No announcements at the moment.</p>
        )}
      </div>

      <div className={styleDashboardRegistrar.dashboardContent}>

        <div className={styleDashboardRegistrar.dashboardContainerSubjects}>
          <div className={styleDashboardRegistrar.dashboardTop}>
            <div>
              <img src={tor} alt="" className={styleDashboardRegistrar.dashboardIcons} />
            </div>
            <div className={styleDashboardRegistrar.dashboardDescription}>
              <span className={styleDashboardRegistrar.spanLabel}>Transcript of Records (TOR)</span>
            </div>
          </div>
          <button
            className={styleDashboardRegistrar.dashboardButtons}
            id={styleDashboardRegistrar.dashboardButtonSubjects}
            onClick={() => handleNavigation('/registrarStaff/tor', 'Transcript of Records (TOR)')}
          >
            <span>View Details</span>
            <img src={arrowB} alt="" className={styleDashboardRegistrar.buttonIcons} />
          </button>
        </div>

        <div className={styleDashboardRegistrar.dashboardContainerStudents}>
          <div className={styleDashboardRegistrar.dashboardTop}>
            <div>
              <img src={cert} alt="" className={styleDashboardRegistrar.dashboardIcons} />
            </div>
            <div className={styleDashboardRegistrar.dashboardDescription}>
              <span className={styleDashboardRegistrar.spanLabel}>STUDENTS</span>
            </div>
          </div>
          <button
            className={styleDashboardRegistrar.dashboardButtons}
            id={styleDashboardRegistrar.dashboardButtonStudents}
            onClick={() => handleNavigation('/registrarStaff/certifications', 'certifications')}
          >
            <span>View Details</span>
            <img src={arrowG} alt="" className={styleDashboardRegistrar.buttonIcons} />
          </button>
        </div>
      </div>
    </div>
  );
}
