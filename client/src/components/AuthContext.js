import React, { useReducer, createContext } from "react";
import { cartReducer } from "./reducers";

const initialState = {
    user: {id: 0, remote_user: '', firstname: '', lastname: '', auth_level: 0, email: '', department_id: 0}
}

const AuthProvider = ({children}) => {
    
    const [state, dispatch] = useReducer(cartReducer, initialState);

    return (
	<Context.Provider
	    value={[state, dispatch]}>
	    {children}
	</Context.Provider>
    );
};
export const Context = createContext(initialState);
export default AuthProvider;