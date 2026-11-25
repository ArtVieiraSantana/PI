import React, { useEffect } from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { iniciarBancoLocal } from './src/database/localDb';

export default function App() {
  useEffect(() => {
    iniciarBancoLocal();
  }, []);

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
