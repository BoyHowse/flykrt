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
    <div className="cart-wrapper">
      <div className="cart-container">
        <h2>🛒 Tu carrito (con alas)</h2>

        {cart.map((product) => {
          const isExpanded = expandedProductId === product.id;
          return (
            <div key={product.id} className="cart-product-card" onClick={() => toggleExpand(product.id)}>
              {product.image && !/logo|favicon|default/i.test(product.image) ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="cart-product-image"
                />
              ) : (
                <img
                  src={`https://source.unsplash.com/96x96/?${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  className="cart-product-image"
                />
              )}
              <div className="cart-product-content">
                <h3>{product.name}</h3>
                <p>
                  <strong>Precio:</strong> {product.price ? `$${product.price.toLocaleString()} COP` : 'No disponible'}
                </p>
                <p>
                  <strong>Total:</strong> {product.price && !isNaN(product.price)
                    ? `$${(parseInt(product.price) * (quantities[product.id] || 1)).toLocaleString()} COP`
                    : 'No disponible'}
                </p>
                <label>Cantidad:
                  <input
                    type="number"
                    min="1"
                    value={quantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    className="cart-quantity-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                </label>
                {isExpanded && (
                  <>
                    <p>{product.description}</p>
                    <p><small>Link original: <a href={product.sourceLink} target="_blank" rel="noreferrer">{product.sourceLink}</a></small></p>
                  </>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(product.id);
                }}
                className="cart-remove-button"
                title="Eliminar producto"
              >
                🗑
              </button>
            </div>
          );
        })}

        <div className="cart-summary">
          <p>Total de productos: <strong>{totalProducts}</strong></p>
          <p>
            <strong>Subtotal:</strong> ${subtotal.toLocaleString()} COP
            &nbsp;&nbsp;
            <strong>Dólares:</strong> {(subtotal / dollarTRM).toFixed(2)} USD
          </p>
          <p>
            Peso estimado: <strong>{totalWeight.toFixed(2)} kg</strong>
          </p>
          <p>
            <strong>Envío FLYKRT:</strong> <strong>${shippingCost.toFixed(2)}</strong>
          </p>
          <hr />
          <p>
            Total a pagar en USD: <span>${((subtotal / dollarTRM) + shippingCost).toFixed(2)} USD</span>
          </p>
        </div>

        {!user && cart.length > 0 && (
          <div className="cart-login-warning">
            <p>🛑 Para continuar con la compra, por favor:</p>
            <button
              onClick={handleGoogleLogin}
              className="cart-login-button"
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
