import { useState, useEffect, useContext, useRef } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 
import styleRegistrar from './registrarDashboard.module.css';
import eGradeLogo from '../../assets/images/eGradeLogo-removebg-preview.png';
import dashboard from '../../assets/icons/meterW.png';
import tor from '../../assets/icons/tor.png';
import cert from '../../assets/icons/cert.png';
import leaderboard from '../../assets/icons/leaderboard.png';
import settings from '../../assets/icons/settings.png';
import menu from '../../assets/icons/menu1.png';
import userImg from '../../assets/icons/userFinal.png';
import logout from '../../assets/icons/logout.png';
import { HeaderDashboard } from '../../components/HeaderDashboard/HeaderDashboard';
import { ActiveButtonContext } from '../../utils/contexts/ActiveButtonContext';
import { usePath } from '../../utils/contexts/PathContext';
import useGetRegistrarDetails from '../../utils/hooks/registrarStaffHooks/useGetRegistrarDetails';
import axios from 'axios';
import {toast} from 'react-toastify';

export function RegistrarDashboard() {
  const { activeButton, updateActiveButton } = useContext(ActiveButtonContext);
  const [isActive, setIsActive] = useState(false);

  const sidebarMenuRefs = useRef([]);

  
  const { userDetails, loading, error } = useGetRegistrarDetails(userId);

  // Extract userId from JWT token
  const token = localStorage.getItem("token");
  let userId = "";
  let id = "";
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id; // Ensure this matches your token's structure
      id = decodedToken.userId;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  // Access the path context
  const { updatePath } = usePath();

  useEffect(() => {
    const savedActiveButton = localStorage.getItem('activeButton');
    if (savedActiveButton) {
      updateActiveButton(savedActiveButton);
    }
  }, [updateActiveButton]);
 

  const toggleSidebar = () => {
    setIsActive(!isActive);
  };

  const handleHover = (isHovered) => {
    const sidebar = document.querySelector(`.${styleRegistrar.sidebar}`);
    if (sidebar) {
      sidebar.style.zIndex = isHovered ? '9999' : 'initial';
    }
  };

  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // If your backend has a way to verify the token, make a request to validate it
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000; // Get current time in seconds
          if (decodedToken.exp < currentTime) {
            // Token expired, clear localStorage
            console.warn("Token expired, logging out.");
            handleLogout();
          }
        } catch (error) {
          console.error("Invalid token, clearing localStorage.", error);
          handleLogout();
        }
      } else {
        // No token found, ensure proper login flow
        handleLogout();
      }
    };
  
    validateToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeButton');
    window.location.href = '/'; // Redirect to login page or wherever you need
    console.log('Logged out successfully');
  };

  const handleConfirmLogout = async () => {
    try {

      // Update isActive to false
      await axios.patch(`https://egrade-backend.onrender.com/api/update-registrar-staff-status/${userId}`, { isActive: false });
  
      // Call the server-side API to log the activity
      await axios.post('https://egrade-backend.onrender.com/api/logout-activity', { 
        userID: id, 
        activityDescription: 'logged out'
      });

      // Proceed with logging out
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('activeButton');
      window.location.href = '/'; // Navigate to home page
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging activity during logout:', error);
    }
  };

  // Set paths to null on list item click
  const handleMenuItemClick = (btnId) => {
    updateActiveButton(btnId);
    updatePath(null, null); // Set both paths to null
  };

  return (
    <div className={styleRegistrar.dashboardContainer}>
      <div className={`${styleRegistrar.sidebar} ${isActive ? styleRegistrar.active : ''}`}>
        <div className={styleRegistrar.logo}>
          <img src={eGradeLogo} alt="eGrade Logo" className={styleRegistrar.eGradeLogo} />
          <img src={menu} onClick={toggleSidebar} id={styleRegistrar.btn} />
        </div>

        <div className={styleRegistrar.userContainer}>
          <div className={styleRegistrar.userImgContainer}>
            <img src={userImg} alt="user_icon" className={styleRegistrar.userImg} />
          </div>
          <div className={styleRegistrar.userInfo}>
            {loading && <p>Loading...</p>}
            {error && <p>Error fetching user details.</p>}
            {userDetails && (
              <>
                <p className={styleRegistrar.userName}>{userDetails.first_name} {userDetails.last_name}</p>
                <p className={styleRegistrar.userStatus}>{userDetails.title}</p>
              </>
            )}
          </div>
        </div>

        <ul className={styleRegistrar.sidebarMenu}>
          {[
            { to: 'dashboard', label: 'Dashboard', icon: dashboard, btnId: 'dashboard' },
            { to: 'tor', label: 'Transcript of Records (TOR)', icon: tor, btnId: 'tor' },
            { to: 'certifications', label: 'Certifications', icon: cert, btnId: 'certifications' },
            { to: 'leaderboard', label: 'Leaderboard', icon: leaderboard, btnId: 'leaderboard' },
            { to: 'settings', label: 'Settings', icon: settings, btnId: 'settings' },
          ].map(({ to, label, icon, btnId }, index) => (
            <li
              key={btnId}
              className={styleRegistrar.sidebarMenuItem}
              onMouseEnter={() => handleHover(true)}
              onMouseLeave={() => handleHover(false)}
              ref={(el) => (sidebarMenuRefs.current[index] = el)}
              onClick={() => handleMenuItemClick(btnId)} // Set paths to null on click
            >
              <Link
                to={to}
                className={`${styleRegistrar.sidebarMenuLink} ${activeButton === btnId ? styleRegistrar.active : ''}`}
                onClick={() => updateActiveButton(btnId)}
              >
                <img src={icon} className={styleRegistrar.sidebarIcons} alt={`${label} Icon`} />
                <span className={styleRegistrar.navItem}>{label}</span>
              </Link>
              <span className={styleRegistrar.tooltip}>{label}</span>
            </li>

          ))}
          <li
            className={styleRegistrar.sidebarMenuItem}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
            ref={(el) => (sidebarMenuRefs.current[sidebarMenuRefs.current.length] = el)}
          >
            <button onClick={handleLogoutClick} className={styleRegistrar.sidebarMenuLink}>
              <img src={logout} className={styleRegistrar.sidebarIcons} alt="Logout" />
              <span className={styleRegistrar.navItem}>Logout</span>
            </button>
            <span className={styleRegistrar.tooltip}>Logout</span>
          </li>
        </ul>
      </div>

      <div className={styleRegistrar.mainContent}>
        <HeaderDashboard />
        <Outlet />
      </div>

      {isLogoutModalOpen && (
        <div className={styleRegistrar.modalOverlay}>
          <div className={styleRegistrar.modal}>
            <h2>Confirm Logout</h2>
            <h4>Are you sure you want to logout?</h4>
            <div className={styleRegistrar.buttonRow}>
              <button 
                onClick={handleConfirmLogout} 
                className={styleRegistrar.confirmLogoutBtn}
              >
                Yes, Logout
              </button>
              <button 
                onClick={() => setLogoutModalOpen(false)} 
                className={styleRegistrar.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
