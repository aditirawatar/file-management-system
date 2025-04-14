import { Link } from "react-router-dom";

function Navbar()
{
    return(
        <>
        <div className="flex justify-around border border-neutral-100 py-2">
        <Link to="/" className="text-2xl font-bold " >Home</Link>
        <Link to="/Login" className="text-2xl font-bold " >Login</Link>
        
        </div>
        </>
    )
}
export default Navbar;