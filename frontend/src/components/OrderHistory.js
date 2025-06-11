import React from 'react';

function OrderHistory({ orderHistory }) {
  return (
    <div className="order-history">
      <h2 className="order-history-title">Historial de Pedidos</h2>
      {orderHistory.length === 0 ? (
        <p>No hay pedidos previos.</p>
      ) : (
        orderHistory.map((order, index) => (
          <div key={index} className="order-item">
            <p><strong>Pedido:</strong> {order.orderNumber}</p>
            <p><strong>Fecha:</strong> {new Date(order.date).toLocaleString()}</p>
            <p><strong>Peso:</strong> {order.totalWeight.toFixed(2)} kg</p>
            <p><strong>Costo de Envío:</strong> ${order.shippingCost.toFixed(2)}</p>
            <p><strong>Productos:</strong> {order.cart.length}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default OrderHistory;