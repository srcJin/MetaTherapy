# **Metaverse Therapy**

### An online platform for drug addiction people to heal through the digital world.

## Pages:

**Landing Page (Index page)**

Router: /

Description: first impression to the user

**Login Page**

Router: /user/login

Description: user login

Design: username + password + captcha

**Register page (Cloudinary API)**

Router: /user/register

Description: Register a new user
Design:  username, password, gender, birthday, nickname, image upload

**Headshot Listing Page**

Router: /shop/headshot

Description: Upload your headshot then choose your new identity
Create a series of AI-Generated Headshots for your semi-digital curing life.

**Room Listing Page**

Router: /shop/room

Description: Choose from a series of rooms specifically designed for you.

Design: 

**Shopping Cart Page**

Router: /shop/cart

Description: A list of selected items

**Checkout Page ( Stripe API)**

Router: /shop/checkout

Description: Purchase with your digital currency!

**About Page**

Router: /about

Description: author information and GitHub links

## Website map:

## Main Pages:

### Landing Page (Index page)

Router: /

Description: This is the first impression to the user.

### Shop Page

Router: /shop

Description: This page allow users to select between different catagories

### About Page

Router: /about

Description: This page contains author information and GitHub links.

## User related:

### Login Page

Router: /user/login

Description: This is where the user logs in.

Design: Username + Password + Email+ Captcha, auto-generate an user_id

### Register page (Cloudinary API)

Router: /user/register

Description: This is where a new user can register.

Design: Username, Password, Gender, Birthday, Nickname, Image Upload

## Product Listings:

### Headshot Listing Page

Router: /shop/headshot

Description: Upload your headshot and choose your new identity. Create a series of AI-generated headshots for your semi-digital life.

### Treatment Listing Page

Router: /shop/treatment

Description: select from a series of fun drug treatments

### Room Listing Page

Router: /shop/room

Description: Choose from a series of rooms specifically designed for you.

Design:

## Order Management:

### Shopping Cart Page

Router: /shop/cart

Description: This page displays a list of selected items.

### Checkout Page (Stripe API)

Router: /shop/checkout

Description: This page allows you to purchase with your digital currency.

### Order Page

Router: /shop/order

Description: Manage orders

### 

## Database Design:

```sql
Mysql -u root
CREATE USER 'jin'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
grant all privileges on *.* to 'jin'@'%';
FLUSH PRIVILEGES; // flush will refresh the privileges without restarting the mysql
```

```sql
create database sitedb;
DROP DATABASE mydb;
```

```sql
./db-migrate.sh create rooms
```

```sql
mysql -u root
use sitedb;
show tables;
describe rooms;
```

```sql
+-------------+--------------+------+-----+---------+----------------+
| Field       | Type         | Null | Key | Default | Extra          |
+-------------+--------------+------+-----+---------+----------------+
| room_id     | int unsigned | NO   | PRI | NULL    | auto_increment |
| name        | varchar(255) | NO   |     | NULL    |                |
| cost        | int          | YES  |     | NULL    |                |
| description | text         | YES  |     | NULL    |                |
| image_url   | text         | YES  |     | NULL    |                |
| category_id | int          | YES  |     | NULL    |                |
+-------------+--------------+------+-----+---------+----------------+
6 rows in set (0.00 sec)
```

```sql
**./db-migrate.sh -- up**
./db-migrate.sh -- down
```

up: execute the instructions

down: undo the instructions

### Table: Users

| Column Name | Data Type | Key | Note |
| --- | --- | --- | --- |
| user_id | INT | PRIMARY | auto-generated |
| username | VARCHAR(50) | UNIQUE | notNull, length:255 |
| password | VARCHAR(255) |  |  |
| email | VARCHAR(100) | UNIQUE |  |
| address | VARCHAR(200) |  | hidden |
| phone_number | VARCHAR(20) |  | not now |

### Table: Categories

| Column Name | Data Type | Key |
| --- | --- | --- |
| category_id | INT | PRIMARY |
| name | VARCHAR(50) | UNIQUE |
| parent_id | INT |  |

### Table: Rooms

| Column Name | Data Type | Key |
| --- | --- | --- |
| room_id | INT | PRIMARY |
| name | VARCHAR(100) |  |
| description | TEXT |  |
| cost | DECIMAL(10, 2) |  |
| image_url | VARCHAR(200) |  |
| category_id | INT | FOREIGN KEY (Categories.category_id) |

### Table: Headshots

| Column Name | Data Type | Key |
| --- | --- | --- |
| headshot_id | INT | PRIMARY |
| name | VARCHAR(100) |  |
| description | TEXT |  |
| cost | DECIMAL(10, 2) |  |
| image_url | VARCHAR(200) |  |
| category_id | INT | FOREIGN KEY (Categories.category_id) |

### Table: Treatments

| Column Name | Data Type | Key |
| --- | --- | --- |
| treatment_id | INT | PRIMARY |
| name | VARCHAR(100) |  |
| description | TEXT |  |
| cost | DECIMAL(10, 2) |  |
| image_url | VARCHAR(200) |  |
| category_id | INT | FOREIGN KEY (Categories.category_id) |

### Table: Shopping_Carts

| Column Name | Data Type | Key |
| --- | --- | --- |
| item_id | INT | PRIMARY |
| order_id | INT | FOREIGN KEY (Orders.order_id) |
| product_id | INT | FOREIGN KEY (Products.product_id) |
| quantity | INT |  |
| price | DECIMAL(10, 2) |  |

### Table: Orders

| Column Name | Data Type | Key |
| --- | --- | --- |
| order_id | INT | PRIMARY |
| user_id | INT | FOREIGN KEY (Users.user_id) |
| date | DATETIME |  |
| total_price | DECIMAL(10, 2) |  |

### Table: Order_Items

| Column Name | Data Type | Key |
| --- | --- | --- |
| item_id | INT | PRIMARY |
| order_id | INT | FOREIGN KEY (Orders.order_id) |
| product_id | INT | FOREIGN KEY (Products.product_id) |
| quantity | INT |  |
| price | DECIMAL(10, 2) |  |

This is just a basic design and can be modified based on the specific needs of your shopping website.

Sure, here are the relationships between the tables:

- The relationship between the `Users` table and the `Headshots` table is one-to-many, as one user can have multiple headshots but each headshot belongs to only one user.
- The relationship between the `Users` table and the `Cart` table is also one-to-many, as one user can have multiple items in their cart but each cart belongs to only one user.
- The relationship between the `Headshots` table and the `Cart` table is many-to-many, as multiple headshots can be added to multiple carts. To represent this relationship, we use a third table called a junction table or an association table, which in this case is the `Cart` table.
- The relationship between the `Rooms` table and the `Cart` table is also many-to-many, as multiple rooms can be added to multiple carts. Again, we use the `Cart` table as the junction table to represent this relationship.
- The relationship between the `Cart` table and the `Orders` table is one-to-one, as each cart can be associated with only one order but each order can be associated with only one cart.



# Based on Framework Project

## Dependencies
* `express`
* `hbs`
* `wax-on`
* `dotenv`
* `knex`
* `bookshelf`
* `forms`
* `express-session`
* `session-file-store`
* `connect-flash`
* `cloudinary`
* `csurf`
* `stripe`
* `jsonwebtoken`
