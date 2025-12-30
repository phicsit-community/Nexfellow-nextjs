// import { Outlet } from "react-router-dom";
// import styled from "styled-components";

// //components
// // import Sidebar from "./Components/Sidebar";
// import Sidebar from "./Components/Sidebar/Sidebar"

// const Container = styled.div`
//   display: flex;
//   width: 100%;
// `;


// const Layout = () => {
//   return (
//     <Container>
//       <Sidebar />
//       <Outlet />
//     </Container>
//   );
// };

// export default Layout;



import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

// Components
// import Navbar from '../../components/Navbar/Navbar';
// import Footer from '../../components/Footer/Footer';
import Loader from '../../Components/Loader/Loader'
import Header from '../../Components/Header/Header';
import Sidebar from '../../Components/Sidebar/Sidebar';

// Style
import style from './Layout.module.css';

const Layout = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={style.container}>
      <Header />
      <div className={style.main}>
        <div className={style.sidebar}>
          <Sidebar />
        </div>
        <div className={style.content}>
          <Outlet />
        </div>
      </div>
      {/* Uncomment the Footer if needed */}
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
