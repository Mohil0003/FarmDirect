USE FarmDirectDB;
GO

-- 1. Insert Categories
INSERT INTO Categories (CategoryName, Description) VALUES
('Vegetables', 'Fresh farm vegetables like tomatoes, potatoes, spinach'),
('Fruits', 'Seasonal fruits like mangoes, apples, bananas'),
('Grains', 'Rice, Wheat, and Pulses'),
('Dairy', 'Fresh Milk, Curd, Ghee');

-- 2. Insert Users (Admin, Farmers, Consumers)
-- PasswordHash is dummy (in real app, use BCrypt hash)
INSERT INTO Users (FullName, Email, PasswordHash, Role, PhoneNumber, Address, Latitude, Longitude) VALUES
('Admin User', 'admin@farmdirect.com', 'hashed_secret', 'Admin', '9876543210', 'Headquarters, Gujrat', 23.0225, 72.5714),
('Ramesh Patel', 'ramesh@farmer.com', 'hashed_secret', 'Farmer', '9123456780', 'Green Farm, Anand', 22.5645, 72.9289),
('Suresh Kumar', 'suresh@farmer.com', 'hashed_secret', 'Farmer', '9123456781', 'Sunny Acres, Rajkot', 22.3039, 70.8022),
('Priya Sharma', 'priya@consumer.com', 'hashed_secret', 'Consumer', '9988776655', '123 Main St, Ahmedabad', 23.0225, 72.5714),
('Rahul Verma', 'rahul@consumer.com', 'hashed_secret', 'Consumer', '9988776644', '456 West End, Vadodara', 22.3072, 73.1812);

-- 3. Insert Products
-- Note: FarmerIds are 2 and 3 based on above insert
INSERT INTO Products (FarmerId, CategoryId, Name, Description, BasePrice, CurrentPrice, StockQuantity, Unit, HarvestDate, ExpiryDate, ImageUrl, IsActive) VALUES
(2, 1, 'Organic Tomatoes', 'Fresh red tomatoes harvested this morning', 40.00, 40.00, 100.00, 'Kg', GETDATE(), DATEADD(day, 5, GETDATE()), 'url_to_tomato_img', 1),
(2, 1, 'Fresh Spinach', 'Green leafy spinach', 30.00, 30.00, 50.00, 'Bunch', GETDATE(), DATEADD(day, 2, GETDATE()), 'url_to_spinach_img', 1),
(3, 2, 'Kesar Mangoes', 'Sweet seasonal mangoes', 120.00, 120.00, 200.00, 'Kg', DATEADD(day, -2, GETDATE()), DATEADD(day, 7, GETDATE()), 'url_to_mango_img', 1),
(3, 4, 'A2 Cow Milk', 'Fresh raw milk', 60.00, 60.00, 50.00, 'Liter', GETDATE(), DATEADD(day, 1, GETDATE()), 'url_to_milk_img', 1);

-- 4. Insert Cart (Priya has items in cart)
INSERT INTO Cart (ConsumerId, ProductId, Quantity) VALUES
(4, 1, 2.5), -- 2.5 Kg Tomatoes
(4, 3, 5.0); -- 5 Kg Mangoes

-- 5. Insert Orders (Rahul placed an order)
INSERT INTO Orders (ConsumerId, OrderDate, TotalAmount, Status, DeliveryAddress) VALUES
(5, DATEADD(day, -1, GETDATE()), 200.00, 'Delivered', '456 West End, Vadodara');

-- 6. Insert OrderItems (Items inside Rahul's order)
-- OrderId is 1 (based on above insert)
INSERT INTO OrderItems (OrderId, ProductId, Quantity, UnitPrice) VALUES
(1, 1, 2.0, 40.00), -- 2 Kg Tomatoes @ 40
(1, 3, 1.0, 120.00); -- 1 Kg Mangoes @ 120

-- 7. Insert Payments
INSERT INTO Payments (OrderId, TransactionId, PaymentMethod, Amount, Status) VALUES
(1, 'TXN123456789', 'UPI', 200.00, 'Success');

-- 8. Insert Reviews
INSERT INTO Reviews (ConsumerId, ProductId, Rating, Comment) VALUES
(5, 1, 5, 'Very fresh tomatoes, loved it!'),
(5, 3, 4, 'Mangoes were sweet but slightly small.');

-- 9. Insert Audit Logs
INSERT INTO AuditLogs (Action, TableName, RecordId, Details) VALUES
('UserRegistration', 'Users', 4, 'New consumer registered via email'),
('PriceUpdate', 'Products', 3, 'Auto-discount applied: 10% off');
