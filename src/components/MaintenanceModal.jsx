// components/MaintenanceModal.js
import React from 'react';

const MaintenanceModal = () => {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}>
      <h2>Sistema en mantenimiento</h2>
      <p>Estamos trabajando para solucionarlo. Por favor, intentá más tarde.</p>
    </div>
  );
};

export default MaintenanceModal;
