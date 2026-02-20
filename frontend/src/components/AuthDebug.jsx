import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuthDebug = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading auth...</div>;

  return (
    <div style={{ 
      // position: 'fixed', 
      // top: 10, 
      // right: 10, 
      // background: 'rgba(0,0,0,0.8)', 
      // color: 'white', 
      // padding: '10px', 
      // borderRadius: '5px',
      // fontSize: '12px',
      // zIndex: 9999
    }}>
      {/* <div>Auth Status: {user ? 'Logged In' : 'Not Logged In'}</div> */}
      {user && (
        <>
          {/* <div>Role: {user.role}</div>
          <div>Name: {user.name}</div>
          <div>Email: {user.email}</div> */}
        </>
      )}
    </div>
  );
};

export default AuthDebug;