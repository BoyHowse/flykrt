import React from 'react';

const UserProfile = ({ user, shippingInfo, handleLogout, setAddressSaved }) => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <img src={user.photo} alt="user" style={{ width: '40px', borderRadius: '50%' }} />
        <div>
          <p style={{ margin: 0, color: '#111' }}>👤 <strong>{user.name}</strong></p>
          <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>
            Enviar a: {shippingInfo.address ? shippingInfo.address.split(' ')[0] + '...' : ''}
            <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setAddressSaved(false); }} style={{
              background: 'none', border: 'none', color: '#2F80ED', cursor: 'pointer', fontSize: '13px', marginLeft: '6px'
            }}>
              ✏️
            </button>
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>{user.email}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        style={{
          padding: '6px 16px',
          fontSize: '14px',
          backgroundColor: '#BDBDBD',
          color: '#333',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease-in-out',
          marginTop: '10px'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#a3a3a3'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#BDBDBD'}
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default UserProfile;