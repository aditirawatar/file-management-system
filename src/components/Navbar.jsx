import { Link } from "react-router-dom";

function Navbar()
{
    return(
        <>
        <div className="flex justify-between   text-gray-700 border-b border-gray-400 bg-gray-100 py-3 px-18 m-0">
        <Link to="/" className="text-3xl  font-bold " >Fileflow</Link>
        <Link to="/Login" className="text-3xl font-bold " >Login</Link>
        
        
        </div>
        </>
    )
}
export default Navbar;