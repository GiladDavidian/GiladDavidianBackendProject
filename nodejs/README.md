# Full-Stack Web API Project

This project provides an API for managing users and business cards, using advanced server-side technologies.

## 🚀 Key Features

* **User Management:**
    * Registration, login, and user authentication.
    * Support for different user types: regular, business, and admin.
    * Viewing personal and public user profiles.
* **Business Card Management:**
    * Create, update, delete, and view cards.
    * A "like" mechanism for cards.
    * Viewing personal and other users' cards.
* **Data Validation:**
    * Uses the **Joi** library for server-side data validation.
    * Checks for unique email addresses during user registration and card creation.
* **Security:**
    * Password hashing using the **bcrypt** library.
    * User authentication via **JSON Web Tokens (JWT)**.
    * Role-based authorization for different user types.

## ⚙️ Technologies

This project is built using the following technologies:

* **Node.js**: Server-side runtime environment.
* **Express**: Web framework for building the server.
* **MongoDB**: A flexible and efficient NoSQL database.
* **Mongoose**: An ODM (Object-Data Mapping) library for managing data in MongoDB.
* **Joi**: A library for data validation.
* **JWT (jsonwebtoken)**: For creating user authentication and security.
* **Bcrypt**: For securely hashing passwords.
* **CORS (Cross-Origin Resource Sharing)**: For handling requests from different origins.
* **Dotenv**: For managing environment variables.
* **Morgan**: For server request logging.

## 🚀 Installation and Running

To install and run the project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <URL_TO_YOUR_REPO>
    cd <PROJECT_FOLDER>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure environment variables:**
    Create a file named `.env.atlas` in the project root directory and add the following variables:
    ```
    MONGO_URLPROD=mongodb+srv://<username>:<password>@<cluster_name>...
    JWT_SECRET=your_jwt_secret_key
    PORT=3000
    ```
4.  **Run the server:**
    ```bash
    npm start
    ```
    The server will run on port 3000 by default.

## 📁 Key File Structure

* **`index.js`**: The main file that sets up the server, connects to the database, and handles the main routes.
* **`handlers/`**: A directory containing the route handlers for each model:
    * **`users.js`**: Handles user-related requests (registration, login, etc.).
    * **`cards.js`**: Handles card-related requests (creation, updates, etc.).
* **`validation/`**: A directory containing the Joi validation schemas:
    * **`user.js`**: Joi schema for users.
    * **`card.js`**: Joi schema for cards.
* **`.env.atlas`**: A file containing the secret environment variables.

## 🛠️ API Usage

You can use the API with any suitable tool, such as Postman or Thunder Client, by sending requests to the following endpoints:

* **Users:** `/users`
* **Cards:** `/cards`