import React from 'react';

const ShippingForm = ({ shippingInfo, setShippingInfo, setAddressSaved }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('flykrt_shipping', JSON.stringify(shippingInfo));
    setAddressSaved(true);
    alert('✅ Dirección guardada exitosamente');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold border-b-2 border-black pb-2 mb-6">📦 Dirección de envío</h2>
      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          placeholder="Nombre completo"
          name="fullName"
          value={shippingInfo.fullName}
          onChange={handleChange}
          className="w-full border border-black px-4 py-2 text-lg placeholder-gray-500"
        />
        <input
          type="text"
          placeholder="Dirección"
          name="address"
          value={shippingInfo.address}
          onChange={handleChange}
          className="w-full border border-black px-4 py-2 text-lg placeholder-gray-500"
        />
        <input
          type="text"
          placeholder="Ciudad"
          name="city"
          value={shippingInfo.city}
          onChange={handleChange}
          className="w-full border border-black px-4 py-2 text-lg placeholder-gray-500"
        />
        <input
          type="text"
          placeholder="País"
          name="country"
          value={shippingInfo.country}
          onChange={handleChange}
          className="w-full border border-black px-4 py-2 text-lg placeholder-gray-500"
        />
        <input
          type="text"
          placeholder="Teléfono"
          name="phone"
          value={shippingInfo.phone}
          onChange={handleChange}
          className="w-full border border-black px-4 py-2 text-lg placeholder-gray-500"
        />
      </div>
      <button
        type="button"
        onClick={handleSave}
        className="w-full bg-black text-white mt-6 py-2 text-lg hover:bg-gray-800 transition"
      >
        Guardar dirección
      </button>
    </div>
  );
};

export default ShippingForm;