import React, { useState, useEffect } from "react";
import styleStudent from "./studentsDashboard.module.css";
import {toast} from "react-toastify";
import { jwtDecode } from "jwt-decode";
import useGetStudentDetails from "../../../utils/hooks/studentHooks/useGetStudentDetails";
import useStudentLookup from "../../../utils/hooks/studentHooks/useStudentLookup";
import useGetRemovalComplete from "../../../utils/hooks/removalCompletionFormHooks/useGetRemovalComplete";
import useUpdateStudentSubjects from "../../../utils/hooks/studentHooks/useUpdateStudentSubjects";

import useYearLevels from '../../../utils/hooks/yearLevelHooks/useYearLevels';
import useSemester from '../../../utils/hooks/semesterHooks/useSemester';

import verifiedIcon from '../../../assets/icons/verified.png';

import useFetchSubjects from '../../../utils/hooks/subjectsHooks/useGetSubjects';

export function StudentsDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  
  const token = localStorage.getItem("token");
  let userId = "";

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }

  const {
    userDetails,
    loading: userLoading,
    error: userError,
    refetch: fetchUserDetails,
  } = useGetStudentDetails(userId);


  const {
    studentDetails: matchedStudents,
    loading: lookupLoading,
    error: lookupError,
  } = useStudentLookup(userDetails?.last_name, userDetails?.first_name);

  const { removalCompleteData, error: removalCompleteError } = useGetRemovalComplete();
  const { loading: updateLoading, error: updateError } = useUpdateStudentSubjects(userId, matchedStudents);

  const { subjects, errorSubject } = useFetchSubjects();


  useEffect(() => {
    if (userDetails?.grades) {
      const studentSubjects = userDetails.grades.flatMap(grade => grade.subjects);
      console.log("Student's Subjects:", studentSubjects);
    }
  }, [userDetails]);

  // Greeting
  const [greeting, setGreeting] = useState("");
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting("Good morning");
    } else if (hours < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  // Modal handling
  const handleCardClick = (offeredValue) => {
    if (!userDetails || !subjects) {
      console.error("User details or subjects are not loaded.");
      toast.error("User details or subjects are not loaded.");
      return;
    }
   
    // Filter the subjects based on the user's department, curriculum_effectivity, and offered value
    const matchedSubjects = subjects.filter(subject => {
  
      // Standardize comparison by trimming and converting to lowercase
      const offeredMatch = subject?.offered?.trim().toLowerCase() === offeredValue.trim().toLowerCase();
      const departmentMatch = subject?.department?.trim().toLowerCase() === userDetails?.course?.trim().toLowerCase();
      const effectiveYearMatch = subject?.effective?.trim() === userDetails?.curriculum_effectivity?.trim();
  
      return offeredMatch && departmentMatch && effectiveYearMatch;
    });
  
    // Set filtered subjects and open the modal
    setFilteredSubjects(matchedSubjects);
    setSelectedCard(offeredValue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard("");
    setFilteredSubjects([]);
  };

  const { yearLevels } = useYearLevels();
  const { semesters } = useSemester();

  // State for filter values
  const [selectedYearLevel, setSelectedYearLevel] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const handleResetFilters = () => {
    setSelectedYearLevel('');
    setSelectedSemester('');
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  return (
    <div className={isModalOpen ? `${styleStudent.mainContainer} ${styleStudent.blurred}` : styleStudent.mainContainer}>
      <div className={styleStudent.greetingCard}>
        <h2>
          {greeting}, {userDetails ? userDetails.first_name : "Student"}!
        </h2>
        <p>Welcome to your dashboard.</p>
      </div>

      {userDetails?.isVerified ? (
        <div className={styleStudent.verifiedMessage}>
          <p>
            <img src={verifiedIcon} alt="Verified" className={styleStudent.verifiedIcon} />
            Your account is verified.
          </p>
        </div>
      ) : (
        <div className={styleStudent.verificationMessage}>
          <p>Please verify your account in settings to access all features.</p>
        </div>
      )}

      <div className={styleStudent.dashboardContent}>
        <div className={styleStudent.filters}>
          <select
            className={styleStudent.filterDropdown}
            value={selectedYearLevel}
            onChange={(e) => setSelectedYearLevel(e.target.value)}
          >
            <option value="">All Year Levels</option>
            {yearLevels.map(yearLevel => (
              <option key={yearLevel._id} value={yearLevel.yearLevel}>{yearLevel.yearLevel}</option>
            ))}
          </select>

          <select
            className={styleStudent.filterDropdown}
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="">All Semesters</option>
            {semesters.map(sem => (
              <option key={sem._id} value={sem.semester}>{sem.semester}</option>
            ))}
          </select>

          <button className={styleStudent.filterDropdown} onClick={handleResetFilters}>
            Reset
          </button>
        </div>

        <div className={styleStudent.cardContainer}>
          <div className={styleStudent.yearContainer}>
            {(!selectedYearLevel || selectedYearLevel === "1") && (!selectedSemester || selectedSemester === "1st") && (
              <div
                className={styleStudent.card}
                onClick={() => handleCardClick("FIRST YEAR (First Semester)")}
              >
                <div className={styleStudent.subjectTitle}>FIRST YEAR (First Semester)</div>
              </div>
            )}

            {(!selectedYearLevel || selectedYearLevel === "1") && (!selectedSemester || selectedSemester === "2nd") && (
              <div
                className={styleStudent.card}
                onClick={() => handleCardClick("FIRST YEAR (Second Semester)")}
              >
                <div className={styleStudent.subjectTitle}>FIRST YEAR (Second Semester)</div>
              </div>
            )}
          </div>

          <div className={styleStudent.yearContainer}>
            {(!selectedYearLevel || selectedYearLevel === "2") && (!selectedSemester || selectedSemester === "1st") && (
              <div
                className={styleStudent.card}
                onClick={() => handleCardClick("SECOND YEAR (First Semester)")}
              >
                <div className={styleStudent.subjectTitle}>SECOND YEAR (First Semester)</div>
              </div>
            )}

            {(!selectedYearLevel || selectedYearLevel === "2") && (!selectedSemester || selectedSemester === "2nd") && (
              <div
                className={styleStudent.card}
                onClick={() => handleCardClick("SECOND YEAR (Second Semester)")}
              >
                <div className={styleStudent.subjectTitle}>SECOND YEAR (Second Semester)</div>
              </div>
            )}
          </div>

          <div className={styleStudent.yearContainer}>
            {(!selectedYearLevel || selectedYearLevel === "3") && (!selectedSemester || selectedSemester === "1st") && (
              <div
                className={styleStudent.card}
                onClick={() => handleCardClick("THIRD YEAR (First Semester)")}
              >
                <div className={styleStudent.subjectTitle}>THIRD YEAR (First Semester)</div>
              </div>
            )}

            {(!selectedYearLevel || selectedYearLevel === "3") && (!selectedSemester || selectedSemester === "2nd") && (
              <>
                <div
                  className={styleStudent.card}
                  onClick={() => handleCardClick("THIRD YEAR (Second Semester)")}
                >
                  <div className={styleStudent.subjectTitle}>THIRD YEAR (Second Semester)</div>
                </div>
              </>
            )}

            {(!selectedYearLevel || selectedYearLevel === "3") && (!selectedSemester || selectedSemester === "summer") && (
              <>
                <div
                  className={styleStudent.card}
                  onClick={() => handleCardClick("SUMMER")}
                >
                  <div className={styleStudent.subjectTitle}>SUMMER</div>
                </div>
              </>
            )}
          </div>

          <div className={styleStudent.yearContainer}>
            {(!selectedYearLevel || selectedYearLevel === "4") && (!selectedSemester || selectedSemester === "1st") && (
              <div
                className={styleStudent.card}
                onClick={() => handleCardClick("FOURTH YEAR (First Semester)")}
              >
                <div className={styleStudent.subjectTitle}>FOURTH YEAR (First Semester)</div>
              </div>
            )}

            {(!selectedYearLevel || selectedYearLevel === "4") && (!selectedSemester || selectedSemester === "2nd") && (
              <>
                <div
                  className={styleStudent.card}
                  onClick={() => handleCardClick("FOURTH YEAR (Second Semester)")}
                >
                  <div className={styleStudent.subjectTitle}>FOURTH YEAR (Second Semester)</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className={styleStudent.modalOverlay}>
          <div className={styleStudent.modalContent}>
            <span className={styleStudent.closeModal} onClick={handleCloseModal}>
              &times;
            </span>
            <h3>Subjects for {selectedCard}:</h3>
            {filteredSubjects.length > 0 ? (
              <table className={styleStudent.gradeTable}>
                <thead>
                  <tr>
                    <th>Grade</th>
                    <th>Subject Code</th>
                    <th>Subject Title</th>
                    <th>Units</th>
                    <th>Pre - Requisite</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((subject, index) => {
                    const studentSubject = userDetails?.grades.flatMap(grade => grade.subjects).find(
                      (studSub) => studSub.subject_code === subject.subject_code
                    );

                    const removalDoc = removalCompleteData?.find(
                      (doc) =>
                        doc.last_name === userDetails?.last_name &&
                        doc.first_name === userDetails?.first_name &&
                        doc.middle_initial === userDetails?.middle_initial &&
                        doc.subject.trim() === studentSubject?.subject_code.trim()
                    );

                    const finalGrade = studentSubject?.FINAL_GRADE ?? ''; 
                    const ratingObtained = removalDoc?.rating_obtained ? ` / ${removalDoc.rating_obtained}` : '';

                    return (
                      <tr key={index}>
                        <td>{finalGrade + ratingObtained}</td>
                        <td>{subject.subject_code}</td>
                        <td>{subject.subject_title}</td>
                        <td>{subject.unit}</td>
                        <td>{subject.prerequisite}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>No subjects found for {selectedCard}.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
