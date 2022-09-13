import React, { useReducer, createContext, useEffect } from "react";
import { cartReducer } from "./reducers";

const initialState = {
    samples: [],
    nuclides: [],
    cart: [],
    loans: [],
    loanconfirmation: {}
}
const local = JSON.parse(localStorage.getItem("state"));

const GlobalState = ({children}) => {
    
    // Testataan onko lokaalisti jo jotain tilaa, jos on niin käyttöön.
    const [state, dispatch] = useReducer(cartReducer, local || initialState);

    // Jos state objekti muuttuu niin tallennetaan se local storageen.
    useEffect(() => {
	localStorage.setItem("state", JSON.stringify(state));
    }, [state]);

    return (
	<Context.Provider
	    value={[state, dispatch]}>
	    {children}
	</Context.Provider>
    );
};
export const Context = createContext(initialState);
export default GlobalState;

