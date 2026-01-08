// import { useState } from "react";
// import ClipLoader from "react-spinners/ClipLoader";

// const override = {
//   display: "block",
//   margin: "0 auto",
//   borderColor: "red",
// };

// function Loader({loading,setLoading}) {

//   let [color, setColor] = useState("#ffffff");

//   return (
//     <div className="sweet-loading">
//       <button onClick={() => setLoading(!loading)}>Toggle Loader</button>
//       <input
//         value={color}
//         onChange={(input) => setColor(input.target.value)}
//         placeholder="Color of the loader"
//       />

//       <ClipLoader
//         color={color}
//         loading={loading}
//         cssOverride={override}
//         size={150}
//         aria-label="Loading Spinner"
//         data-testid="loader"
//       />
//     </div>
//   );
// }

// export default Loader;

import React from "react";
import "./Loader.css";
const Loader = () => {
  return <div className="loader"></div>;
};

export default Loader;
