import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart as addToCartAPI, updateCartItem, removeFromCart as removeFromCartAPI } from '../services/cartService';
import { getProductById } from '../services/productService';
import type { CartResponse, ProductResponse } from '../models/apiTypes';
import { cartToasts } from '../utils/toastUtils';

interface CartItemWithProduct extends CartResponse {
    product?: ProductResponse;
}

interface CartContextType {
    cartItems: CartItemWithProduct[];
    cartCount: number;
    isLoading: boolean;
    error: string | null;
    addToCart: (productId: number, quantity: number, productName?: string) => Promise<void>;
    updateCart: (cartId: number, newQuantity: number, productId: number, productName?: string) => Promise<void>;
    removeFromCart: (cartId: number, productName?: string) => Promise<void>;
    clearCart: () => void;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate cart count
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Load cart from API and localStorage
    const loadCart = async () => {
        if (!user) {
            setCartItems([]);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Get cart items from API
            const carts = await getCart(user.userId);

            // Fetch product details for each cart item
            const itemsWithProducts = await Promise.all(
                carts.map(async (cart) => {
                    try {
                        const product = await getProductById(cart.productId);
                        return { ...cart, product };
                    } catch {
                        return { ...cart, product: undefined };
                    }
                })
            );

            setCartItems(itemsWithProducts);

            // Save to localStorage for persistence
            localStorage.setItem(`cart_${user.userId}`, JSON.stringify(itemsWithProducts));
        } catch (err: any) {
            setError(err.message || 'Failed to load cart');
            console.error('Error loading cart:', err);

            // Try to load from localStorage as fallback
            try {
                const savedCart = localStorage.getItem(`cart_${user.userId}`);
                if (savedCart) {
                    setCartItems(JSON.parse(savedCart));
                }
            } catch (localErr) {
                console.error('Error loading cart from localStorage:', localErr);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Load cart on mount and when user changes
    useEffect(() => {
        loadCart();
    }, [user]);

    // Add item to cart
    const addToCart = async (productId: number, quantity: number = 1, productName?: string) => {
        if (!user) {
            cartToasts.error('Please login to add items to cart');
            return;
        }

        try {
            setIsLoading(true);

            // Check if item already exists in cart
            const existingItem = cartItems.find(item => item.productId === productId);

            if (existingItem) {
                // Update quantity if item exists
                const newQuantity = existingItem.quantity + quantity;
                await updateCartItem(existingItem.cartId, newQuantity, user.userId, productId);
            } else {
                // Add new item
                await addToCartAPI(productId, quantity, user.userId);
            }

            // Reload cart
            await loadCart();

            // Show success toast
            if (productName) {
                cartToasts.added(productName);
            } else {
                cartToasts.added('Product');
            }
        } catch (err: any) {
            cartToasts.error(err.message || 'Failed to add item to cart');
            console.error('Error adding to cart:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Update cart item quantity
    const updateCart = async (cartId: number, newQuantity: number, productId: number, productName?: string) => {
        if (!user) return;

        if (newQuantity <= 0) {
            await removeFromCart(cartId, productName);
            return;
        }

        try {
            setIsLoading(true);
            await updateCartItem(cartId, newQuantity, user.userId, productId);
            await loadCart();

            if (productName) {
                cartToasts.updated(productName);
            }
        } catch (err: any) {
            cartToasts.error(err.message || 'Failed to update cart');
            console.error('Error updating cart:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Remove item from cart
    const removeFromCart = async (cartId: number, productName?: string) => {
        try {
            setIsLoading(true);
            await removeFromCartAPI(cartId);
            await loadCart();

            if (productName) {
                cartToasts.removed(productName);
            }
        } catch (err: any) {
            cartToasts.error(err.message || 'Failed to remove item');
            console.error('Error removing from cart:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Clear entire cart
    const clearCart = () => {
        setCartItems([]);
        if (user) {
            localStorage.removeItem(`cart_${user.userId}`);
        }
        cartToasts.cleared();
    };

    // Refresh cart (public method)
    const refreshCart = async () => {
        await loadCart();
    };

    const value: CartContextType = {
        cartItems,
        cartCount,
        isLoading,
        error,
        addToCart,
        updateCart,
        removeFromCart,
        clearCart,
        refreshCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
