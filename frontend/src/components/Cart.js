import React from 'react';
const Cart = ({ cart, handleRemove, neonBlue, neonGreen, user, handleGoogleLogin }) => {
  const [expandedProductId, setExpandedProductId] = React.useState(null);

  const [quantities, setQuantities] = React.useState(() =>
    cart.reduce((acc, item) => ({ ...acc, [item.id]: 1 }), {})
  );

  const handleQuantityChange = (id, value) => {
    setQuantities(prev => ({ ...prev, [id]: parseInt(value) || 1 }));
  };

  const totalWeight = cart.reduce((sum, item) => sum + (item.estimatedWeight * (quantities[item.id] || 1)), 0);
  const shippingCost = totalWeight <= 3 ? 24 : Math.ceil(totalWeight) * 8;

  const dollarTRM = 4000; // Reemplazar con una prop o valor dinámico si se desea
  // Calcular subtotal de todos los productos
  const subtotal = cart.reduce((sum, item) => {
    const quantity = quantities[item.id] || 1;
    const price = parseInt(item.price);
    return sum + (isNaN(price) ? 0 : price * quantity);
  }, 0);
  const totalProducts = cart.reduce((sum, item) => {
    const quantity = quantities[item.id] || 1;
    return sum + quantity;
  }, 0);

  const toggleExpand = (id) => {
    setExpandedProductId(prev => (prev === id ? null : id));
  };

  return (
    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        width: '70%',
        height: 'auto',
        maxHeight: '80vh',
        overflowY: 'auto',
        borderRadius: '12px',
        backgroundColor: '#f9fafb',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        border: 'none',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignSelf: 'flex-end'
      }}>
        <h2 style={{ color: '#000000', borderBottom: '2px solid #2F80ED', paddingBottom: '6px' }}>🛒 Tu carrito (con alas)</h2>

        {cart.map((product) => {
          const isExpanded = expandedProductId === product.id;
          return (
            <div key={product.id} style={{
              marginTop: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              padding: '16px',
              position: 'relative',
              cursor: 'pointer',
              display: 'flex',
              gap: '16px',
              alignItems: 'center'
            }} onClick={() => toggleExpand(product.id)}>
              {product.image && !/logo|favicon|default/i.test(product.image) ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '96px',
                    height: '96px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid #ccc'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://source.unsplash.com/96x96/?${encodeURIComponent(product.name)}`;
                  }}
                />
              ) : (
                <img
                  src={`https://source.unsplash.com/96x96/?${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  style={{
                    width: '96px',
                    height: '96px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid #ccc'
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#000000', marginBottom: '6px' }}>{product.name}</h3>
                <p style={{ margin: 0, color: '#000000' }}>
                  <strong>Precio:</strong> {product.price ? `$${product.price.toLocaleString()} COP` : 'No disponible'}
                </p>
                <p style={{ margin: 0, color: '#000000' }}>
                  <strong>Total:</strong> {product.price && !isNaN(product.price)
                    ? `$${(parseInt(product.price) * (quantities[product.id] || 1)).toLocaleString()} COP`
                    : 'No disponible'}
                </p>
                <label style={{ color: '#000000' }}>Cantidad:
                  <input
                    type="number"
                    min="1"
                    value={quantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    style={{ marginLeft: '8px', width: '50px', border: '1px solid #ccc', borderRadius: '6px', padding: '6px' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
                {isExpanded && (
                  <>
                    <p style={{ marginTop: '8px', color: '#000000' }}>{product.description}</p>
                    <p><small style={{ color: '#000000' }}>Link original: <a href={product.sourceLink} target="_blank" rel="noreferrer" style={{ color: '#000000' }}>{product.sourceLink}</a></small></p>
                  </>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(product.id);
                }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#2F80ED',
                  borderRadius: '6px',
                  border: 'none',
                  width: '30px',
                  height: '30px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(47, 128, 237, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  lineHeight: '1'
                }}
                title="Eliminar producto"
              >
                🗑
              </button>
            </div>
          );
        })}

        <div style={{ marginTop: '24px', background: '#ffffff', border: '1px solid #ccc', borderRadius: '8px', padding: '16px', width: '100%', maxWidth: '480px', alignSelf: 'center' }}>
          <p style={{ margin: '8px 0', fontSize: '15px', color: '#000000' }}>Total de productos: <strong>{totalProducts}</strong></p>
          <p style={{ margin: '8px 0', fontSize: '15px', color: '#000000' }}>
            <strong>Subtotal:</strong> ${subtotal.toLocaleString()} COP
            &nbsp;&nbsp;
            <strong style={{ color: '#2F80ED' }}>Dólares:</strong> {(subtotal / dollarTRM).toFixed(2)} USD
          </p>
          <p style={{ margin: '8px 0', fontSize: '15px', color: '#000000' }}>
            Peso estimado: <strong style={{ color: '#2F80ED' }}>{totalWeight.toFixed(2)} kg</strong>
          </p>
          <p style={{ margin: '8px 0', fontSize: '15px', color: '#000000' }}>
            <strong>Envío FLYKRT:</strong> <strong style={{ color: '#2F80ED' }}>${shippingCost.toFixed(2)}</strong>
          </p>
          <hr style={{ margin: '12px 0' }} />
          <p style={{ margin: '8px 0', fontSize: '16px', fontWeight: 'bold', color: '#000000' }}>
            Total a pagar en USD: <span style={{ color: '#27AE60' }}>${((subtotal / dollarTRM) + shippingCost).toFixed(2)} USD</span>
          </p>
        </div>

        {!user && cart.length > 0 && (
          <div style={{ marginTop: '20px', padding: '16px', border: '1px solid #d1d9e6', backgroundColor: '#f0f4f8', borderRadius: '8px' }}>
            <p style={{ color: '#000000' }}>🛑 Para continuar con la compra, por favor:</p>
            <button
              onClick={handleGoogleLogin}
              style={{
                background: '#2F80ED',
                color: 'white',
                padding: '10px 20px',
                cursor: 'pointer',
                border: 'none',
                marginTop: '10px',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(47, 128, 237, 0.4)'
              }}
            >
              Inicia sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
