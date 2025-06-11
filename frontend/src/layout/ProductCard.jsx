

import React from 'react';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const { name, image, price, quantity } = product;

  return (
    <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-lg border border-gray-300 bg-white flex flex-col hover:shadow-2xl transition-shadow">
      <img className="w-full h-64 object-cover" src={image} alt={name} />
      <div className="p-4 flex flex-col gap-2">
        <h4 className="text-lg font-semibold text-gray-800">{name}</h4>
        <p className="text-sm text-gray-600">Precio: COP {price}</p>
        <p className="text-sm text-gray-600">Cantidad: {quantity}</p>
      </div>
    </div>
  );
};

export default ProductCard;