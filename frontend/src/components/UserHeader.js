import React from 'react';

const Order = ({ shippingInfo, totalWeight, shippingCost, confirmOrder, generatePDF }) => {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '600px',
        margin: '20px auto',
        padding: '12px',
        backgroundColor: '#fff',
        border: '2px solid #000',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <h2
        style={{
          borderBottom: '2px solid #000',
          paddingBottom: '6px',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        💳 Método de pago
      </h2>
      <p style={{ color: '#000' }}>Aún no está disponible el sistema de pagos.</p>

      <div style={{ backgroundColor: '#dcdcdc', padding: '10px', border: '1px solid #000' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, color: '#000' }}>**** **** **** 4242</p>
          <p style={{ margin: 0, color: '#000' }}>VISA</p>
        </div>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#000' }}>Titular: Juan Perez</p>
        <p style={{ margin: '0', fontSize: '14px', color: '#000' }}>Exp: 12/26</p>
        <p style={{ margin: '0', fontSize: '14px', color: '#000' }}>CVV: •••</p>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          disabled
          style={{
            margin: '4px',
            padding: '6px 16px',
            border: '2px solid black',
            backgroundColor: '#ccc',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'not-allowed'
          }}
        >
          Pagar con Stripe (🔒 pronto)
        </button>
        <button
          disabled
          style={{
            margin: '4px',
            padding: '6px 16px',
            border: '2px solid black',
            backgroundColor: '#ccc',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'not-allowed'
          }}
        >
          Pagar con MercadoPago (🔒 pronto)
        </button>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <button
          onClick={confirmOrder}
          style={{
            margin: '4px',
            padding: '6px 16px',
            border: '2px solid black',
            backgroundColor: '#fff',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Confirmar pedido (simulado)
        </button>
        <button
          onClick={generatePDF}
          style={{
            margin: '4px',
            padding: '6px 16px',
            border: '2px solid black',
            backgroundColor: '#fff',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Descargar resumen en PDF
        </button>
      </div>
    </div>
  );
};

export default Order;