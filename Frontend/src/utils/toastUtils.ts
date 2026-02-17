import toast from 'react-hot-toast';

/**
 * Toast notification utilities with custom styling
 */

// Custom toast options matching app theme
const toastOptions = {
    success: {
        duration: 3000,
        style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '500',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
        },
    },
    error: {
        duration: 4000,
        style: {
            background: '#ef4444',
            color: '#fff',
            fontWeight: '500',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
        },
    },
    info: {
        duration: 3000,
        style: {
            background: '#3b82f6',
            color: '#fff',
            fontWeight: '500',
        },
    },
};

/**
 * Show success toast
 */
export const showSuccessToast = (message: string) => {
    toast.success(message, toastOptions.success);
};

/**
 * Show error toast
 */
export const showErrorToast = (message: string) => {
    toast.error(message, toastOptions.error);
};

/**
 * Show info toast
 */
export const showInfoToast = (message: string) => {
    toast(message, toastOptions.info);
};

/**
 * Cart-specific toast notifications
 */
export const cartToasts = {
    added: (productName: string) => {
        showSuccessToast(`${productName} added to cart!`);
    },

    updated: (productName: string) => {
        showSuccessToast(`${productName} quantity updated`);
    },

    removed: (productName: string) => {
        showInfoToast(`${productName} removed from cart`);
    },

    cleared: () => {
        showInfoToast('Cart cleared');
    },

    error: (message: string) => {
        showErrorToast(message);
    },

    outOfStock: (productName: string) => {
        showErrorToast(`${productName} is out of stock`);
    },

    maxQuantity: (productName: string, maxQty: number) => {
        showErrorToast(`Maximum ${maxQty} units available for ${productName}`);
    },
};

/**
 * Order-specific toast notifications
 */
export const orderToasts = {
    created: (orderId: number) => {
        showSuccessToast(`Order #${orderId} placed successfully!`);
    },

    failed: (message: string) => {
        showErrorToast(`Order failed: ${message}`);
    },
};
