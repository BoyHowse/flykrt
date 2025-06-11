import React, { useState, useEffect } from 'react';
import { auth, provider, signInWithPopup, signOut } from './firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import emailjs from 'emailjs-com';
import './darkTheme.css';

function App() {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (link.trim() !== '') {
      const simulatedProduct = {
        id: Date.now(),
        name: 'Producto simulado – Zapatillas Urbanas',
        price: 49.99,
        image: 'https://via.placeholder.com/300x300?text=Producto',
        description: 'Zapatillas casuales de cuero sintético. Producto simulado.',
        sourceLink: link,
        estimatedWeight: 1.2
      };

      setCart((prev) => [...prev, simulatedProduct]);
      setLink('');
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
      body: cart.map(p => [p.name, `$${p.price}`, `${p.estimatedWeight} kg`, p.sourceLink])
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

  const renderOrderHistory = () => {
    if (!orderHistory.length) return null;
    return (
      <div style={{ marginTop: '60px', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: '#2F80ED' }}>📖 Historial de Pedidos</h2>
        {orderHistory.map((order, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '10px', marginBottom: '20px', backgroundColor: '#fff' }}>
            <p><strong>Pedido:</strong> {order.orderNumber}</p>
            <p><strong>Fecha:</strong> {new Date(order.date).toLocaleString()}</p>
            <p><strong>Cliente:</strong> {order.shippingInfo.fullName}</p>
            <p><strong>Envío:</strong> {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.country}</p>
            <p><strong>Teléfono:</strong> {order.shippingInfo.phone}</p>
            <p><strong>Total productos:</strong> {order.cart.length}</p>
            <p><strong>Peso:</strong> {order.totalWeight.toFixed(2)} kg</p>
            <p><strong>Costo de envío:</strong> ${order.shippingCost.toFixed(2)}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif', backgroundColor: '#f9fbfd', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#2F80ED', fontWeight: '700' }}>🚀 Bienvenido a FLYKRT</h1>

      {!user ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handleGoogleLogin}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#2F80ED',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1366d6'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2F80ED'}
          >
            Iniciar sesión con Google
          </button>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <img src={user.photo} alt="user" style={{ width: '40px', borderRadius: '50%' }} />
              <div>
                <p style={{ margin: 0, color: '#111' }}>👤 <strong>{user.name}</strong></p>
                {/* Dirección resumida editable */}
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

          {!addressSaved && (
            <div style={{ maxWidth: '500px', margin: '0 auto', marginBottom: '30px' }}>
              <h2 style={{ color: '#333', borderBottom: '2px solid #2F80ED', paddingBottom: '6px' }}>📦 Dirección de envío</h2>
              <input
                type="text"
                placeholder="Nombre completo"
                value={shippingInfo.fullName}
                onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                style={{ width: '100%', marginBottom: '10px', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}
              />
              <input
                type="text"
                placeholder="Dirección"
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                style={{ width: '100%', marginBottom: '10px', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}
              />
              <input
                type="text"
                placeholder="Ciudad"
                value={shippingInfo.city}
                onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                style={{ width: '100%', marginBottom: '10px', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}
              />
              <input
                type="text"
                placeholder="País"
                value={shippingInfo.country}
                onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                style={{ width: '100%', marginBottom: '10px', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={shippingInfo.phone}
                onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                style={{ width: '100%', marginBottom: '10px', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}
              />
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('flykrt_shipping', JSON.stringify(shippingInfo));
                  setAddressSaved(true);
                  alert('✅ Dirección guardada exitosamente');
                }}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#27AE60',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Guardar dirección
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://instagram.com/..."
              style={{
                width: '80%',
                padding: '12px 20px',
                fontSize: '18px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                marginTop: '20px',
                backgroundColor: '#fff',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
              }}
            />
            <br />
            <button
              type="submit"
              style={{
                marginTop: '15px',
                padding: '10px 24px',
                fontSize: '16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#2F80ED',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease-in-out',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1366d6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2F80ED'}
            >
              Añadir producto
            </button>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                style={{
                  marginTop: '15px',
                  marginLeft: '10px',
                  padding: '10px 24px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#828282',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6b6b6b'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#828282'}
              >
                Vaciar carrito
              </button>
            )}
          </form>

          {cart.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <h2 style={{ color: '#333', borderBottom: '2px solid #2F80ED', paddingBottom: '6px' }}>🛒 Tu carrito (con alas)</h2>
              <p>Total de productos: <strong style={{ color: '#111' }}>{cart.length}</strong></p>
              <p>Peso estimado: <strong style={{ color: '#111' }}>{totalWeight.toFixed(2)} kg</strong></p>
              <p><strong style={{ color: '#111' }}>Envío FLYKRT:</strong> <strong style={{ color: '#111' }}>${shippingCost.toFixed(2)}</strong></p>

              {cart.map((product) => (
                <div key={product.id} style={{
                  marginTop: '30px',
                  maxWidth: '500px',
                  margin: '0 auto',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                  padding: '20px',
                  position: 'relative'
                }}>
                  <img src={product.image} alt="Producto" style={{ width: '100%', borderRadius: '10px' }} />
                  <h3 style={{ color: '#111' }}>{product.name}</h3>
                  <p><strong style={{ color: '#111' }}>Precio:</strong> <strong style={{ color: '#111' }}>${product.price}</strong></p>
                  <p style={{ color: '#333' }}>{product.description}</p>
                  <p><small>Link original: <a href={product.sourceLink} target="_blank" rel="noreferrer">{product.sourceLink}</a></small></p>
                  <button
                    onClick={() => handleRemove(product.id)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#ff4d4f',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      color: 'white',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease-in-out',
                    }}
                    title="Eliminar producto"
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d9363e'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ff4d4f'}
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}

          {addressSaved && (
            <div style={{ marginTop: '40px', maxWidth: '500px', margin: '0 auto' }}>
              <h2 style={{ color: '#333', borderBottom: '2px solid #2F80ED', paddingBottom: '6px' }}>📍 Resumen de envío</h2>
              <p><strong style={{ color: '#111' }}>Nombre:</strong> <strong style={{ color: '#111' }}>{shippingInfo.fullName}</strong></p>
              <p><strong style={{ color: '#111' }}>Dirección:</strong> <strong style={{ color: '#111' }}>{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.country}</strong></p>
              <p><strong style={{ color: '#111' }}>Teléfono:</strong> <strong style={{ color: '#111' }}>{shippingInfo.phone}</strong></p>
              <p style={{ fontSize: '14px', marginTop: '10px' }}>
                <button
                  onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setAddressSaved(false); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#2F80ED',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: 'inherit'
                  }}
                >
                  ✏️ Editar dirección
                </button>
              </p>
            </div>
          )}

          <div style={{ marginTop: '40px', maxWidth: '500px', margin: '0 auto', padding: '20px', border: '2px dashed #ccc', borderRadius: '12px' }}>
            <h2 style={{ color: '#333', borderBottom: '2px solid #2F80ED', paddingBottom: '6px' }}>💳 Método de pago</h2>
            <p style={{ color: '#888' }}>Aún no está disponible el sistema de pagos.</p>

            <div style={{ backgroundColor: '#f2f2f2', borderRadius: '10px', padding: '20px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ margin: 0, color: '#555' }}>**** **** **** 4242</p>
                <p style={{ margin: 0, color: '#555' }}>VISA</p>
              </div>
              <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#999' }}>Titular: Juan Perez</p>
              <p style={{ margin: '0', fontSize: '14px', color: '#999' }}>Exp: 12/26</p>
              <p style={{ margin: '0', fontSize: '14px', color: '#999' }}>CVV: •••</p>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button disabled style={{ margin: '5px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#ccc', color: '#666' }}>
                Pagar con Stripe (🔒 pronto)
              </button>
              <button disabled style={{ margin: '5px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#ccc', color: '#666' }}>
                Pagar con MercadoPago (🔒 pronto)
              </button>
            </div>
          </div>

          {cart.length > 0 && addressSaved && (
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
              <button
                onClick={confirmOrder}
                style={{
                  padding: '14px 32px',
                  fontSize: '18px',
                  backgroundColor: '#27AE60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1f8c4a'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#27AE60'}
              >
                Confirmar pedido (simulado)
              </button>
              <button
                onClick={generatePDF}
                style={{
                  marginTop: '20px',
                  padding: '12px 28px',
                  fontSize: '16px',
                  backgroundColor: '#F2994A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d87d2f'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F2994A'}
              >
                Descargar resumen en PDF
              </button>
            </div>
          )}
        </>
      )}
      {renderOrderHistory()}
    </div>
  );
}

export default App;