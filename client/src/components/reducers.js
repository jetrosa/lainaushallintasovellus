export const cartReducer = (state, action) => {
	switch (action.type) {
		case 'SET_USER':
			return {
				...state,
				user: {
					id: action.payload.id,
					remote_user: action.payload.remote_user,
					firstname: action.payload.firstname,
					lastname: action.payload.lastname,
					auth_level: action.payload.auth_level,
					email: action.payload.email, 
					department_id: action.payload.department_id
				}
			};
		case 'SET_SAMPLES':
			return {
				...state,
				samples: action.payload
			};
		case 'SET_NUCLIDES':
			return {
				...state,
				nuclides: action.payload
			};
		case 'SET_LOANS':
			return {
				...state,
				loans: action.payload
			};
		case 'ADD_PRODUCT':
			const duplicate = state.cart.find(e => e.id === action.payload.id);
			if (duplicate) return { ...state };

			return {
				...state,
				cart: state.cart.concat(action.payload)
			};
		case 'REMOVE_PRODUCT':
			return {
				...state,
				cart: state.cart.filter(p => p.id !== action.payload.id),
			}
		case 'UPDATE_LOANCONFIRMATION':
			return {
				...state,
				loanconfirmation: {
					...state.loanconfirmation,
					[action.payload.id]: action.payload.value
				}
			}
		case 'RESET_AFTER_SUBMIT':
			return {
				...state,
				cart: [],
				loanconfirmation: {}
			}
		case 'USER_LOGOUT':
			return {
				...state,
				cart: [],
				loanconfirmation: {}
			}
		default:
			return state;
	}
};