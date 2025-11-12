# 2Settle Admin Dashboard


This is the **2Settle Customer Support Admin Dashboard** website.

**2Settle** is a solution built to allow users easily **spend or send crypto in their fiat currency**.  
Currently, we support sending and spending of:
- **BTC** on **Bitcoin Network**
- **ETH** and **BNB** on **ERC20**
- **TRX** on **TRC20**
- **USDT** on **ERC20**, **BEP20**, and **TRC20**

> ✅ Live website: [https://admin.2settle.io](https://admin.2settle.io)  
> 🔍 Preview deployment: [https://admin-2settle.vercel.app/](https://admin-2settle.vercel.app/)

---

## 🧭 First Time Login

Use your **customer support registered phone number** and the **6-digit PIN** attached to your support ID to log in.  
On successful login, you will be prompted to **change your PIN**.

## 🔐 Subsequent Login

Use the same **registered phone number** and the **new PIN** you set during your first login.

---

## 🚀 Getting Started (Development)

### 1. Clone the Repository

```bash
git clone https://github.com/SIRFITECH/admin.2settle.git
cd admin.2settle
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run Development Server

```bash
pnpm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
.
├── public/               # Static files
├── src/
│   ├── components/       # Reusable UI components
│   ├── helper/           # Utility and helper functions
│   ├── styles/           # Tailwind and global styles
│   ├── types/            # TypeScript types and interfaces
│   └── pages/            # Next.js page routes
├── .env.example          # Example environment configuration
├── package.json          # Project dependencies and scripts
└── README.md             # Project overview and setup guide
```

---

## 🔐 Environment Variables

All required environment variables are defined in the `.env.example` file.  
Copy it to create your own local `.env` file:

```bash
touch .env.development.local .env.local
```

---

## ⚙️ Tech Stack

- **Next.js** – React-based frontend framework with server-side support
- **Tailwind CSS** – Utility-first CSS framework for styling
- **MySQL** – Database for structured data

---

## 🤝 Contributing

We welcome contributions!  
⚠️ **Important:** All contributions must go to the `dev` branch. The `master` branch is protected and only receives code after proper review.

### 🛠️ Contribution Workflow

1. **Fork** this repository to your GitHub account.

2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/your-username/admin.2settle.git
   cd admin.2settle
   ```

3. **Checkout the `dev` branch** and create your own feature branch:

   ```bash
   git checkout dev
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes** and commit them:

   ```bash
   git add .
   git commit -m "feat: your feature description / fix: issue you fixed" 
   ```

5. **Push** to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** into the `dev` branch of this repository.

✅ Once reviewed and approved, it will be merged into `dev`.  
📦 After full testing, `dev` changes will be merged into `master`.

---

## 📄 License

[MIT](LICENSE) – Feel free to use this project for personal or commercial use.

---

Built with ❤️ by the 2Settle team.

