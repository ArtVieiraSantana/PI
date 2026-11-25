import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import HomeScreen from '../screens/HomeScreen';
import DetalheProdutoScreen from '../screens/DetalheProdutoScreen';
import CarrinhoScreen from '../screens/CarrinhoScreen';
import CheckoutScreen from '../screens/CheckoutScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DetalheProduto" component={DetalheProdutoScreen} options={{ headerShown: true, title: 'Produto' }} />
        <Stack.Screen name="Carrinho" component={CarrinhoScreen} options={{ headerShown: true, title: 'Carrinho' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: 'Pagamento' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
