# Admin & User Credentials

Development credentials for accessing different roles within the application.

## 👑 Super Admin
Access the **Admin Dashboard** to manage users, approve sellers, and oversee platform revenue.

- **Email**: `admin@sharesteak.com`
- **Password**: *(Uses Magic Link in Dev)* - Check [Inbucket](http://localhost:54324) if running locally.

> **Tip:** If you prefer password login, sign up as a new user (e.g., `myadmin@test.com`) and run the SQL command below to promote yourself.

## 🚜 Sellers
Access the **Seller Dashboard** to create group buys, manage products, and view orders.

- **Seller 1**: `seller1@sharesteak.com`
- **Seller 2**: `seller2@sharesteak.com`

## 🛒 Buyers
Standard user account for browsing and purchasing.

- **Buyer 1**: `buyer1@sharesteak.com`

---

## 🛠 How to Make Yourself an Admin

If you create a new account and want to promote it to **Super Admin**, run this SQL command in your Supabase SQL Editor:

```sql
UPDATE public.users
SET role = 'ADMIN'
WHERE email = 'YOUR_EMAIL@example.com';
```

## 🛠 How to Make Yourself a Seller

To test the seller flow with a new account:

```sql
UPDATE public.users
SET role = 'SELLER'
WHERE email = 'YOUR_EMAIL@example.com';
```
