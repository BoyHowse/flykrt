

import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#f1f1f1',
      padding: '20px',
      textAlign: 'center',
      borderTop: '1px solid #ccc',
      fontSize: '14px',
      color: '#555',
      marginTop: '40px'
    }}>
      <p>© {new Date().getFullYear()} FLYKRT. Todos los derechos reservados.</p>
      <p>Hecho con ❤️ en Colombia</p>
    </footer>
  );
};

export default Footer;