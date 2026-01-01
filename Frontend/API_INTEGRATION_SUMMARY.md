# API Integration Summary

This document summarizes the backend API integration for the FarmDirect React frontend.

## ✅ Completed Steps

### Step 1: Axios & Environment Setup
- ✅ Updated `src/api/axiosClient.ts` with:
  - Base URL from `VITE_API_URL` environment variable (defaults to `http://localhost:5234`)
  - Request interceptor for Authorization Bearer token
  - Response interceptor for error handling (401 redirects to login)
- ⚠️ **Action Required**: Create `.env` file in Frontend root with:
  ```
  VITE_API_URL=http://localhost:5234
  ```

### Step 2: Type Interfaces
- ✅ Created `src/models/apiTypes.ts` with all DTOs and API response types
- ✅ Matches C# models: User, Product, Category, Cart, Order, OrderItem, Payment, Review
- ✅ All properties converted from PascalCase to camelCase

### Step 3: API Services Created
All services are located in `src/services/`:

1. **authService.ts**
   - `login()` - Authenticates user (NOTE: Currently uses workaround - see service for details)
   - `register()` - Creates new user
   - `registerFarmer()` - Registers as Farmer
   - `registerConsumer()` - Registers as Consumer
   - `logout()` - Clears localStorage
   - `getCurrentUser()` - Gets user from localStorage
   - `getToken()` - Gets token from localStorage

2. **productService.ts**
   - `getAllProducts()` - Fetches all products
   - `getProductById(id)` - Gets single product
   - `getProductsByFarmerId(farmerId)` - Gets farmer's products
   - `getActiveProducts()` - Gets only active products
   - `createProduct(data)` - Creates new product (for Farmers)
   - `updateProduct(id, data)` - Updates product
   - `deleteProduct(id)` - Deletes product

3. **userService.ts**
   - `getAllUsers()` - Gets all users (Admin)
   - `getUserById(id)` - Gets user by ID
   - `getCurrentUserProfile()` - Gets current user profile
   - `updateUserProfile(id, data)` - Updates user profile
   - `deleteUser(id)` - Deletes user
   - `getFarmers()` - Gets all farmers
   - `getConsumers()` - Gets all consumers

4. **orderService.ts**
   - `getAllOrders()` - Gets all orders
   - `getOrderById(id)` - Gets single order
   - `getOrdersByConsumerId(consumerId)` - Gets consumer's orders
   - `createOrder(data)` - Creates new order
   - `updateOrder(id, data)` - Updates order
   - `deleteOrder(id)` - Deletes order

### Step 4: Pages Updated

1. **LoginPage.tsx**
   - ✅ Integrated with `authService.login()`
   - ✅ Saves JWT token and user data to localStorage
   - ✅ Redirects based on user role (Farmer/Admin/Consumer)
   - ✅ Error handling with user-friendly messages

2. **ShopPage.tsx** (Consumer)
   - ✅ Fetches real products using `productService.getAllProducts()`
   - ✅ Displays product cards with real data (images, prices, stock)
   - ✅ Search functionality
   - ✅ Loading and error states
   - ✅ Filters to show only active products

3. **DashboardPage.tsx** (Farmer/Admin)
   - ✅ Fetches farmer's products using `productService.getProductsByFarmerId()`
   - ✅ Displays real stats (total products, revenue, orders)
   - ✅ Shows recent orders from API
   - ✅ Loading and error states
   - ✅ Uses real user data from AuthContext

4. **AuthContext.tsx**
   - ✅ Updated to work with real API responses
   - ✅ Initializes from localStorage on mount
   - ✅ Proper TypeScript types

## ⚠️ Important Notes

### Authentication
The backend currently **does NOT have JWT authentication**. The `authService.login()` function uses a temporary workaround that:
- Fetches all users
- Finds user by email
- Compares password (NOT secure - plain text comparison)

**TODO**: When you add JWT authentication to your backend:
1. Create `/api/Auth/Login` endpoint
2. Update `authService.login()` to call the new endpoint
3. The axios interceptor is already set up to handle JWT tokens

### Environment Variable
Create a `.env` file in the `Frontend/` directory:
```
VITE_API_URL=http://localhost:5234
```

### API Base URL
The default base URL is `http://localhost:5234` (from launchSettings.json). If your backend runs on a different port, update the `.env` file or the default in `axiosClient.ts`.

## 🚀 Usage Examples

### Using Services in Components

```typescript
import { getAllProducts } from '../services/productService';
import { login } from '../services/authService';

// In your component
const loadProducts = async () => {
  try {
    const products = await getAllProducts();
    setProducts(products);
  } catch (error) {
    console.error('Failed to load products:', error);
  }
};
```

### Authentication Flow

```typescript
import { login } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const { login: setAuthUser } = useAuth();

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await login({ email, password });
    setAuthUser({
      userId: response.user.userId,
      name: response.user.fullName,
      email: response.user.email,
      role: response.role,
      token: response.token || '',
    });
    // Redirect based on role...
  } catch (error) {
    // Handle error
  }
};
```

## 📝 Next Steps

1. **Add JWT Authentication** to backend
2. **Update authService.login()** to use the new auth endpoint
3. **Add password hashing** on the backend (bcrypt, etc.)
4. **Create Cart integration** (cartService.ts)
5. **Add Category service** if needed
6. **Implement image upload** for products
7. **Add error boundaries** for better error handling
8. **Add loading skeletons** for better UX

## 🔗 API Endpoints Used

- `GET /api/Users/GetAllUsers`
- `GET /api/Users/{id}`
- `POST /api/Users/AddUser`
- `GET /api/Products/GetAllProducts`
- `GET /api/Products/{id}`
- `POST /api/Products/AddProduct`
- `PUT /api/Products/UpdateProduct/{id}`
- `DELETE /api/Products/DeleteProduct/{id}`
- `GET /api/Order/GetAllOrders`
- `GET /api/Order/{id}`
- `POST /api/Order/AddOrder`

All endpoints follow RESTful conventions and use camelCase JSON responses (default ASP.NET Core behavior).

