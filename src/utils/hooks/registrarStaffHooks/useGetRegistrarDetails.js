import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Custom hook to fetch user details by ID with refetch capability
const useGetRegistrarDetails = (userId) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await axios.get(`https://egrade-backend.onrender.com/api/get_registrar_details/${userId}`);
      setUserDetails(response.data);
      setError(null); // Clear previous error if fetch is successful
    } catch (err) {
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  return { userDetails, loading, error, refetch: fetchUserDetails };
};

export default useGetRegistrarDetails;
