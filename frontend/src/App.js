import React, { useState, useEffect } from 'react';
import { auth, provider, signInWithPopup, signOut } from './firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import emailjs from 'emailjs-com';
import './App.css';
import Cart from './components/Cart';
import OrderHistory from './components/OrderHistory';
import ShippingForm from './components/ShippingForm';
import UserProfile from './components/UserProfile';
import Summary from './components/Summary';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';

function App() {
  const [currentText, setCurrentText] = useState('🚀 Bienvenido a FLYKRT');

  useEffect(() => {
    const messages = [
      '🚀 Bienvenido a FLYKRT',
      'Compra en Colombia, Recibe en Panamá',
      'Volando, rápido, en tus manos'
    ];

    let index = 0;
    let timeout;

    const updateText = () => {
      const message = messages[index];
      let step = 0;
      setCurrentText('');
      const reveal = () => {
        if (step <= message.length) {
          setCurrentText(message.slice(0, step));
          step++;
          timeout = setTimeout(reveal, 50); // typing speed
        } else {
          timeout = setTimeout(() => {
            index = (index + 1) % messages.length;
            updateText();
          }, index === 0 ? 5000 : 3000); // wait time per message
        }
      };
      reveal();
    };

    updateText();
    return () => clearTimeout(timeout);
  }, []);
  const [link, setLink] = useState('');
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem('flykrt_cart');
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const [user, setUser] = useState(null);

  const [shippingInfo, setShippingInfo] = useState(() => {
    const storedInfo = localStorage.getItem('flykrt_shipping');
    return storedInfo ? JSON.parse(storedInfo) : {
      fullName: '',
      address: '',
      city: '',
      country: '',
      phone: ''
    };
  });
  // Nuevo estado para saber si la dirección fue guardada manualmente
  const [addressSaved, setAddressSaved] = useState(!!(shippingInfo && shippingInfo.fullName));

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const userData = {
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL
      };
      setUser(userData);
    } catch (error) {
      alert('Error al iniciar sesión con Google');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const [trm, setTrm] = useState(() => {
    const saved = localStorage.getItem('flykrt_trm');
    const savedTime = localStorage.getItem('flykrt_trm_time');
    if (saved && savedTime && Date.now() - parseInt(savedTime) < 3600000) {
      return parseFloat(saved);
    }
    return null;
  });

  useEffect(() => {
    if (trm === null) {
      fetch('https://api.exchangerate.host/latest?base=COP&symbols=USD')
        .then(res => res.json())
        .then(data => {
          const rate = 1 / data.rates.USD;
          setTrm(rate);
          localStorage.setItem('flykrt_trm', rate);
          localStorage.setItem('flykrt_trm_time', Date.now().toString());
        })
        .catch(() => {
          console.warn('No se pudo obtener la TRM actual. Se intentará de nuevo más tarde.');
        });
    }
  }, [trm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!link.trim()) return;

    const blockedDomains = ['temu.com', 'amazon.com', 'amazon.es', 'amazon.co.uk', 'aliexpress.com'];
    const urlHost = (() => {
      try {
        return new URL(link).hostname.replace('www.', '');
      } catch {
        return '';
      }
    })();

    if (blockedDomains.some(domain => urlHost.includes(domain))) {
      alert('No se permiten tiendas internacionales como Temu o Amazon. Solo se aceptan productos que se vendan desde Colombia.');
      return;
    }

    if (!user && cart.length >= 3) {
      alert('Máximo 3 productos sin iniciar sesión. Regístrate para continuar.');
      return;
    }

    const extractNameFromLink = (url) => {
      const path = new URL(url).pathname;
      const parts = path.split('/');
      const candidate = parts.find(p => p && !p.startsWith('http'));
      return candidate ? candidate.replace(/[-_]/g, ' ') : 'Producto Colombiano';
    };

    const productName = extractNameFromLink(link);

  // Llamado real al backend para obtener datos reales del producto
  try {
    const productData = await fetch('http://localhost:4000/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: link })
    }).then(res => res.json());

    // Extraer correctamente los valores
    const { price, shipping, name, image, shortUrl } = productData;

    // Validar precio: debe ser numérico y razonable
    const validPrice = (!price || isNaN(price) || price > 1000000000) ? 999999 : price;

    // Validar imagen: permitir .webp, .jpg, .jpeg, .png y excluir patrones inválidos
    const isValidImage = (img) => {
      if (!img || typeof img !== 'string') return false;

      const invalidPatterns = [
        'icon', 'favicon', 'logo', 'default', 'placeholder',
        'whatsapp', 'generic', 'blur', 'sprite', 'header', 'profile'
      ];

      try {
        const url = new URL(img);
        const filename = url.pathname.split('/').pop().toLowerCase();

        const validExtensions = ['.webp', '.jpg', '.jpeg', '.png'];

        return (
          validExtensions.some(ext => filename.endsWith(ext)) &&
          !invalidPatterns.some(keyword => filename.includes(keyword))
        );
      } catch {
        return false;
      }
    };

    const validImage = isValidImage(image)
      ? image
      : await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(name || productName)}&client_id=3g6KJm6K9yZK9P6n5K4jzQ8dY7uG5tW9cF7aN2dK6gL4xF5lV2wR8zB4hQ5pX7aB`)
          .then(res => res.json())
          .then(data => {
            const match = data.results?.find(photo =>
              photo.alt_description?.toLowerCase().includes((name || productName).toLowerCase())
            );
            return match?.urls?.regular || data.results?.[0]?.urls?.regular || 'https://via.placeholder.com/600x600?text=Producto';
          })
          .catch(() => 'https://via.placeholder.com/600x600?text=Producto');

    const simulatedProduct = {
      id: Date.now(),
      name: name || productName.charAt(0).toUpperCase() + productName.slice(1),
      priceCOP: validPrice + (shipping || 0),
      price: validPrice,
      image: validImage,
      description: `Producto: ${name || productName}. Precio: $${validPrice.toLocaleString('es-CO')} COP. Envío: $${(shipping || 0).toLocaleString('es-CO')} COP.`,
      sourceLink: shortUrl || link,
      estimatedWeight: (() => {
        const keywords = link.toLowerCase();
        if (keywords.includes('jean') || keywords.includes('pantalon')) return 0.7;
        if (keywords.includes('camiseta') || keywords.includes('tshirt')) return 0.3;
        if (keywords.includes('tenis') || keywords.includes('zapato')) return 1.0;
        if (keywords.includes('chaqueta') || keywords.includes('jacket')) return 1.5;
        return Math.random() * 1.2 + 0.3;
      })()
    };

    setCart((prev) => [...prev, simulatedProduct]);
    setLink('');
  } catch (error) {
    alert('Error al obtener la información del producto. Intenta de nuevo.');
  }
  };

  const handleRemove = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    localStorage.setItem('flykrt_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('flykrt_shipping', JSON.stringify(shippingInfo));
  }, [shippingInfo]);

  const totalWeight = cart.reduce((sum, item) => sum + item.estimatedWeight, 0);
  const shippingCost = totalWeight <= 3 ? 24 : Math.ceil(totalWeight) * 8;

  const generateOrderNumber = () => {
    const today = new Date();
    const datePart = today.toISOString().slice(0, 10).replace(/-/g, ''); // e.g., 20250610
    const orderKey = `flykrt_orders_${datePart}`;
    const todayCount = parseInt(localStorage.getItem(orderKey) || '0', 10) + 1;
    localStorage.setItem(orderKey, todayCount);
    const paddedCount = String(todayCount).padStart(3, '0');
    return `FLY-${datePart}-${paddedCount}`;
  };

  const generatePDF = () => {
    const orderNumber = generateOrderNumber();

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Resumen de Pedido FLYKRT', 14, 22);
    doc.text(`Número de pedido: ${orderNumber}`, 14, 28);

    doc.setFontSize(12);
    doc.text(`Nombre: ${shippingInfo.fullName}`, 14, 32);
    doc.text(`Dirección: ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.country}`, 14, 38);
    doc.text(`Teléfono: ${shippingInfo.phone}`, 14, 44);
    doc.text(`Peso estimado total: ${totalWeight.toFixed(2)} kg`, 14, 50);
    doc.text(`Costo de envío: $${shippingCost.toFixed(2)}`, 14, 56);

    doc.autoTable({
      startY: 65,
      head: [['Producto', 'Precio', 'Peso', 'Link']],
      body: cart.map(p => [p.name, `$${p.priceCOP}`, `${p.estimatedWeight} kg`, p.sourceLink])
    });

    doc.save('resumen_pedido_flykrt.pdf');

    doc.output('blob').then(blob => {
      const reader = new FileReader();
      reader.onload = function () {
        const base64PDF = reader.result.split(',')[1];

        emailjs.send('your_service_id', 'your_template_id', {
          to_email: user.email,
          to_name: user.name,
          message: 'Resumen de tu pedido FLYKRT adjunto',
          order_number: orderNumber,
          attachment: base64PDF
        }, 'your_user_id')
        .then(() => {
          alert('📧 PDF enviado por correo correctamente');
        })
        .catch(() => {
          alert('❌ Error al enviar el correo');
        });
      };
      reader.readAsDataURL(blob);
    });
  };

  // Confirmar pedido (simulado) y guardar en localStorage
  const confirmOrder = () => {
    const orderNumber = generateOrderNumber();
    const orderData = {
      orderNumber,
      user,
      shippingInfo,
      cart,
      totalWeight,
      shippingCost,
      date: new Date().toISOString()
    };
    localStorage.setItem('flykrt_last_order', JSON.stringify(orderData));
    // Guardar historial completo
    const history = JSON.parse(localStorage.getItem('flykrt_order_history')) || [];
    history.push(orderData);
    localStorage.setItem('flykrt_order_history', JSON.stringify(history));
    // Enviar correo al administrador con EmailJS
    emailjs.send(
      'service_xxx', // Reemplazar con tu ID de servicio EmailJS
      'template_admin_xxx', // Reemplazar con tu ID de plantilla para el admin
      {
        to_email: 'contacto@flykrt.com', // Reemplazar con tu correo real de administrador
        to_name: 'Administrador FLYKRT',
        message: `Nuevo pedido confirmado.\n\nPedido: ${orderNumber}\nCliente: ${shippingInfo.fullName}\nDirección: ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.country}\nTeléfono: ${shippingInfo.phone}\nPeso estimado: ${totalWeight.toFixed(2)} kg\nCosto de envío: $${shippingCost.toFixed(2)}\nProductos: ${cart.length}`,
      },
      'user_xxx' // Reemplazar con tu User ID de EmailJS
    )
    .then(() => {
      console.log('📨 Correo al administrador enviado con éxito');
    })
    .catch(() => {
      console.error('❌ Error al enviar correo al administrador');
    });
    alert(`✅ Pedido simulado confirmado.\nNúmero de pedido: ${orderNumber}\nEn breve recibirás un correo de confirmación.`);
    setCart([]);
  };

  // --- HISTORIAL DE PEDIDOS ---
  const orderHistory = JSON.parse(localStorage.getItem('flykrt_order_history')) || [];


  return (
    <div className="app-container main-layout">
      <Navbar />
      <div className="hero-section">
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <span
            style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #ff00cc, #3333ff, #00ffcc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.5s ease'
            }}
            id="flykrt-heading"
          >
            {currentText}
          </span>
        </div>

        {!addressSaved && user && (
          <ShippingForm
            shippingInfo={shippingInfo}
            setShippingInfo={setShippingInfo}
            setAddressSaved={setAddressSaved}
          />
        )}

        <form
          className="add-product-form"
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '40px',
            padding: '0 20px',
            boxSizing: 'border-box',
            width: '100%',
            maxWidth: '1000px',
            marginLeft: 'auto',
            marginRight: 'auto',
            gap: '12px'
          }}
        >
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Inserta el link de tu producto"
            style={{
              flexGrow: 1,
              padding: '16px',
              fontSize: '18px',
              border: '2px solid #ccc',
              borderRadius: '8px',
              outline: 'none',
              minWidth: '300px',
              width: '100%',
              maxWidth: '700px'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '16px 24px',
              fontSize: '18px',
              background: 'linear-gradient(90deg, #6a0dad, #8a2be2)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 10px rgba(255, 0, 204, 0.4)',
              marginTop: '4px'
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = '0 0 20px rgba(138, 43, 226, 0.6)';
              e.target.style.filter = 'brightness(1.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = '0 0 10px rgba(255, 0, 204, 0.4)';
              e.target.style.filter = 'brightness(1)';
            }}
          >
            Añadir producto
          </button>
        </form>
      </div>

      {/* Google login button moved before cart */}

      {!user && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '60px', marginTop: '40px', marginBottom: '40px' }}>
          <button
            className="btn-google-login"
            onClick={handleGoogleLogin}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#4285F4',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => { e.target.style.transform = 'scale(1.05)' }}
            onMouseLeave={(e) => { e.target.style.transform = 'scale(1)' }}
          >
            Inicia sesión para que no pierdas tu carrito
          </button>
        </div>
      )}

      {cart.length > 0 && (
        <>
          <Cart
            cart={cart}
            setCart={setCart}
            totalWeight={totalWeight}
            shippingCost={shippingCost}
            handleRemove={handleRemove}
            handleGoogleLogin={handleGoogleLogin}
            trm={trm}
          />
        </>
      )}

      {user && (
        <>
          <UserProfile
            user={user}
            shippingInfo={shippingInfo}
            handleLogout={handleLogout}
            setAddressSaved={setAddressSaved}
          />
          <Summary
            addressSaved={addressSaved}
            shippingInfo={shippingInfo}
            setAddressSaved={setAddressSaved}
            cart={cart}
            confirmOrder={confirmOrder}
            generatePDF={generatePDF}
            shippingCost={shippingCost}
            totalWeight={totalWeight}
          />
        </>
      )}

      {orderHistory.length > 0 && <OrderHistory orderHistory={orderHistory} />}
      <Footer />
    </div>
  );
}

export default App;