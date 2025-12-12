-- 1. Create Database
CREATE DATABASE FarmDirectDB;
GO
USE FarmDirectDB;
GO

-- 2. Create Users Table
CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(20) CHECK (Role IN ('Farmer', 'Consumer', 'Admin')) NOT NULL,
    PhoneNumber NVARCHAR(15) UNIQUE NOT NULL,
    Address NVARCHAR(MAX),
    Latitude DECIMAL(9,6),
    Longitude DECIMAL(9,6),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 3. Create Categories Table
CREATE TABLE Categories (
    CategoryId INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(50) NOT NULL,
    Description NVARCHAR(255)
);

-- 4. Create Products Table
CREATE TABLE Products (
    ProductId INT PRIMARY KEY IDENTITY(1,1),
    FarmerId INT NOT NULL FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
    CategoryId INT NOT NULL FOREIGN KEY REFERENCES Categories(CategoryId),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    BasePrice DECIMAL(18,2) NOT NULL,
    CurrentPrice DECIMAL(18,2) NOT NULL,
    StockQuantity DECIMAL(10,2) NOT NULL,
    Unit NVARCHAR(20) NOT NULL, -- e.g., 'Kg', 'Dozen'
    HarvestDate DATETIME NOT NULL,
    ExpiryDate DATETIME NOT NULL,
    ImageUrl NVARCHAR(255),
    IsActive BIT DEFAULT 1, -- Changed TRUE to 1
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 5. Create Cart Table (Persistent Shopping)
CREATE TABLE Cart (
    CartId INT PRIMARY KEY IDENTITY(1,1),
    ConsumerId INT NOT NULL FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(ProductId) ON DELETE NO ACTION, 
    Quantity DECIMAL(10,2) NOT NULL,
    AddedAt DATETIME DEFAULT GETDATE()
);

-- 6. Create Orders Table
CREATE TABLE Orders (
    OrderId INT PRIMARY KEY IDENTITY(1,1),
    ConsumerId INT NOT NULL FOREIGN KEY REFERENCES Users(UserId) ON DELETE CASCADE,
    OrderDate DATETIME DEFAULT GETDATE(),
    TotalAmount DECIMAL(18,2) NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled')),
    DeliveryAddress NVARCHAR(MAX) NOT NULL
);

-- 7. Create OrderItems Table
CREATE TABLE OrderItems (
    OrderItemId INT PRIMARY KEY IDENTITY(1,1),
    OrderId INT NOT NULL FOREIGN KEY REFERENCES Orders(OrderId) ON DELETE CASCADE,
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(ProductId),
    Quantity DECIMAL(10,2) NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL -- Snapshot price at time of order
);

-- 8. Create Payments Table
CREATE TABLE Payments (
    PaymentId INT PRIMARY KEY IDENTITY(1,1),
    OrderId INT NOT NULL FOREIGN KEY REFERENCES Orders(OrderId) ON DELETE CASCADE,
    TransactionId NVARCHAR(100), -- From Payment Gateway
    PaymentMethod NVARCHAR(20), -- e.g., 'Card', 'UPI'
    Amount DECIMAL(18,2) NOT NULL,
    Status NVARCHAR(20) CHECK (Status IN ('Success', 'Failed', 'Pending')) NOT NULL,
    PaymentDate DATETIME DEFAULT GETDATE()
);

-- 9. Create Reviews Table
CREATE TABLE Reviews (
    ReviewId INT PRIMARY KEY IDENTITY(1,1),
    ConsumerId INT NOT NULL FOREIGN KEY REFERENCES Users(UserId) ON DELETE NO ACTION, -- Changed to NO ACTION to prevent cycles
    ProductId INT NOT NULL FOREIGN KEY REFERENCES Products(ProductId) ON DELETE CASCADE,
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Comment NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- 10. Create AuditLogs Table (For Security/Debugging)
CREATE TABLE AuditLogs (
    LogId INT PRIMARY KEY IDENTITY(1,1),
    Action NVARCHAR(50), -- e.g., 'PriceUpdate', 'Login'
    TableName NVARCHAR(50),
    RecordId INT,
    Details NVARCHAR(MAX),
    Timestamp DATETIME DEFAULT GETDATE()
);
GO