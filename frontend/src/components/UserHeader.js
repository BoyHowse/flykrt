import React from 'react';
import './globalStyles.css';

const Order = ({ shippingInfo, totalWeight, shippingCost, confirmOrder, generatePDF }) => {
  return (
    <div className="order-container">
      <h2 className="order-title">
        💳 Método de pago
      </h2>
      <p className="order-subtitle">Aún no está disponible el sistema de pagos.</p>

      <div className="card-info">
        <div className="card-info-header">
          <p className="card-number">**** **** **** 4242</p>
          <p className="card-type">VISA</p>
        </div>
        <p className="card-detail">Titular: Juan Perez</p>
        <p className="card-detail">Exp: 12/26</p>
        <p className="card-detail">CVV: •••</p>
      </div>

      <div className="payment-buttons">
        <button disabled className="payment-button disabled">
          Pagar con Stripe (🔒 pronto)
        </button>
        <button disabled className="payment-button disabled">
          Pagar con MercadoPago (🔒 pronto)
        </button>
      </div>

      <div className="action-buttons">
        <button onClick={confirmOrder} className="action-button">
          Confirmar pedido (simulado)
        </button>
        <button onClick={generatePDF} className="action-button">
          Descargar resumen en PDF
        </button>
      </div>
    </div>
  );
};

export default Order;