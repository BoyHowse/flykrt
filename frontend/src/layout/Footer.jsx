import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} FLYKRT. Todos los derechos reservados.</p>
      <p>Hecho con ❤️ en Colombia</p>
    </footer>
  );
};

export default Footer;