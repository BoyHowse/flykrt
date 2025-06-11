

import React from 'react';

function Summary({ addressSaved, shippingInfo, setAddressSaved, cart, confirmOrder, generatePDF, shippingCost, totalWeight }) {
  if (!addressSaved) return null;

  return (
    <div className="summary-container">
      <h2 className="summary-title">📍 Resumen de envío</h2>
      <p><strong>Nombre:</strong> {shippingInfo.fullName}</p>
      <p><strong>Dirección:</strong> {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.country}</p>
      <p><strong>Teléfono:</strong> {shippingInfo.phone}</p>
      <p className="edit-address-link">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setAddressSaved(false);
          }}
          className="btn-edit-address"
        >
          ✏️ Editar dirección
        </button>
      </p>

      <div className="summary-shipping">
        <h2>💳 Método de pago</h2>
        <p className="coming-soon">Aún no está disponible el sistema de pagos.</p>
        <div className="card-preview">
          <div className="card-info">
            <p>**** **** **** 4242</p>
            <p>VISA</p>
          </div>
          <p>Titular: Juan Perez</p>
          <p>Exp: 12/26</p>
          <p>CVV: •••</p>
        </div>
        <div className="payment-buttons">
          <button disabled className="btn-disabled">Pagar con Stripe (🔒 pronto)</button>
          <button disabled className="btn-disabled">Pagar con MercadoPago (🔒 pronto)</button>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="summary-actions">
          <button className="btn-confirm-order" onClick={confirmOrder}>
            Confirmar pedido (simulado)
          </button>
          <button className="btn-download-pdf" onClick={generatePDF}>
            Descargar resumen en PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default Summary;