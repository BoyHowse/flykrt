import React from 'react';

const UserProfile = ({ user, shippingInfo, handleLogout, setAddressSaved }) => {
  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <img src={user.photo} alt="user" className="user-profile-photo" />
        <div>
          <p className="user-profile-name">👤 <strong>{user.name}</strong></p>
          <p className="user-profile-address">
            Enviar a: {shippingInfo.address ? shippingInfo.address.split(' ')[0] + '...' : ''}
            <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setAddressSaved(false); }} className="edit-address-btn">
              ✏️
            </button>
          </p>
          <p className="user-profile-email">{user.email}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="logout-btn"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default UserProfile;