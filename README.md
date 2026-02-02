# TeamSphere

**TeamSphere** — Complete Employee Management System designed to streamline HR operations. Manage employee attendance, leaves, overbreaks, and payroll with precision, while keeping everything organized in a centralized platform.

---

## Features

### Employee Records
- Maintain detailed employee profiles  
- Track roles, departments, and performance metrics  
- Secure centralized database for all employee data  

### Attendance & Leave Tracking
- Automatic monitoring of attendance, late arrivals, and overbreaks  
- Track absences and leave requests  
- Real-time analytics for attendance trends  

### Payroll Automation
- Generate accurate payroll based on attendance and leave data  
- Ensures fair, transparent, and timely employee compensation  
- Reduces manual HR workload significantly  

### Additional Features
- Centralized dashboard for HR managers  
- Secure access and role-based permissions  
- Integration with industry-leading partners and tools  

---

## Tech Stack

- **MongoDB** – Database for storing employee records and payroll data  
- **Express.js** – Backend API framework  
- **React.js** – Frontend library for interactive dashboards  
- **Node.js** – Server runtime  
- **Cloudinary / Cloud Storage** – Optional storage for profile pictures and employee documents  
- **Material-UI (MUI)** – Modern, responsive UI components  
- **Axios** – Frontend-backend communication  

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/teamsphere.git
Navigate to the project directory:

cd teamsphere
Install dependencies:

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
Create a .env file in the backend folder with your environment variables:

MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
Start the backend server:

cd server
npm run dev
Start the frontend:

cd client
npm start
Open your browser at http://localhost:3000

Usage
Log in as HR or admin.

Add, edit, or remove employee records.

Track attendance, leave requests, and overbreaks automatically.

Generate payroll based on attendance data.

Access analytics and reports to monitor team performance.

Contributing
Contributions are welcome! Steps:

Fork the repository

Create a new branch (git checkout -b feature/YourFeature)

Make your changes

Commit your changes (git commit -m 'Add some feature')

Push to your branch (git push origin feature/YourFeature)

Open a Pull Request

License
This project is licensed under the MIT License. See the LICENSE file for details.
