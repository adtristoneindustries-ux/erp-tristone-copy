import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const StaffTab = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin/staff');
  }, [navigate]);

  return null;
};

export default StaffTab;
