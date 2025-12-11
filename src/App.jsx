import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Shared/Layout';
import Dashboard from './components/Dashboard';
import SalesRevenueTracking from './components/SalesRevenueTracking';
import LoginPage from './LoginPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Leads from './components/Leads/Leads';
import Calendar from './components/Calendar/Calendar';
import SingleLeadPage from './components/Leads/SingleLeadPage'
import SingleClientPage from './components/Clients/SingleClientPage'
import Settings from './components/Settings/Settings'
import Clients from './components/Clients/Clients';
import Emails from './components/Emails/Emails';
import Campaigns from './components/Campaigns/Campaigns';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [auth, setAuth] = React.useState(() => ({
    userRole: sessionStorage.getItem('userRole'),
    token: sessionStorage.getItem('token'),
  }));

  React.useEffect(() => {
    const syncAuthFromStorage = () => {
      setAuth({
        userRole: sessionStorage.getItem('userRole'),
        token: sessionStorage.getItem('token'),
      });
    };

    window.addEventListener('authChange', syncAuthFromStorage);
    window.addEventListener('storage', syncAuthFromStorage);

    return () => {
      window.removeEventListener('authChange', syncAuthFromStorage);
      window.removeEventListener('storage', syncAuthFromStorage);
    };
  }, []);

  const { userRole, token } = auth;

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme="light"
      />
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        {userRole && token ? (
          <Route
            path="/"
            element={
              <Layout
                userRole={userRole}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard userRole={userRole} />} />
            <Route path="clients" element={<Clients userRole={userRole} />} />
            <Route path="leads" element={<Leads userRole={userRole} />} />
            <Route path="calendar" element={<Calendar userRole={userRole} />} />
            <Route path="campaigns" element={<Campaigns userRole={userRole} />} />
            <Route path="SingleLeadPage/:id" element={<SingleLeadPage userRole={userRole} />} />
            <Route path="SingleClientPage/:id" element={<SingleClientPage userRole={userRole} />} />
            <Route path="settings" element={<Settings userRole={userRole} />} />
            <Route path="emails" element={<Emails userRole={userRole} />} />
            <Route path="sales" element={<SalesRevenueTracking userRole={userRole} />} />
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                    <p className="text-xl text-gray-600">Page not found</p>
                  </div>
                </div>
              }
            />
          </Route>
        ) : (
          // Redirect all other routes to login if not logged in
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;





// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Layout from './components/Shared/Layout';
// import Dashboard from './components/Dashboard';
// import ClientsLists from './components/ClientsLists';
// import SalesRevenueTracking from './components/SalesRevenueTracking';
// import LoginPage from './LoginPage';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const App = () => {
//   const [sidebarOpen, setSidebarOpen] = React.useState(false);

//   const userRole = "Admin";

//   return (
//     <Router>
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         theme="light"
//       />

//       <Routes>
//         <Route
//           path="/"
//           element={
//             <Layout userRole={userRole} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//           }
//         >
//           <Route index element={<Navigate to="/dashboard" replace />} />
//           <Route path="dashboard" element={<Dashboard userRole={userRole} />} />
//           <Route path="clientslsts" element={<ClientsLists userRole={userRole} />} />
//           <Route path="sales" element={<SalesRevenueTracking userRole={userRole} />} />
//           <Route
//             path="*"
//             element={
//               <div className="flex items-center justify-center min-h-screen">
//                 <div className="text-center">
//                   <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
//                   <p className="text-xl text-gray-600">Page not found</p>
//                 </div>
//               </div>
//             }
//           />
//         </Route>

//         {/* Optional: Keep login route if needed */}
//         <Route path="/login" element={<LoginPage />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;
