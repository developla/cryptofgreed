
import { GameState, Action, GamePhase, TurnType } from '../types';
import { saveGameState, authenticateUser } from '../../lib/storage';

export const handleNavigate = (state: GameState, action: Action): GameState => {
  if (action.type !== 'NAVIGATE') return state;
  
  const newState = {
    ...state,
    gamePhase: action.payload,
    quickAccessOpen: false
  };
  
  saveGameState(newState);
  return newState;
};

export const handleToggleQuickAccess = (state: GameState, action: Action): GameState => {
  if (action.type !== 'TOGGLE_QUICK_ACCESS') return state;
  
  const newState = {
    ...state,
    quickAccessOpen: !state.quickAccessOpen
  };
  
  saveGameState(newState);
  return newState;
};

export const handleLogin = (state: GameState, action: Action): GameState => {
  if (action.type !== 'LOGIN') return state;
  
  // If login data comes from authentication (with user object already validated)
  if (action.payload.authenticated && action.payload.user) {
    const authenticatedUser = {
      id: action.payload.user.id,
      username: action.payload.user.username,
      email: action.payload.user.email,
      isLoggedIn: true,
      maxCharacterSlots: 1, // Set to 1 to limit accounts to only 1 character
      gold: 1000 // Starting gold
    };
    
    // Explicitly cast the game phase to the correct type
    const nextGamePhase: GamePhase = state.activeCharacter ? 'map' : 'character-selection';
    
    const newState = {
      ...state,
      user: authenticatedUser,
      gamePhase: nextGamePhase
    };
    
    saveGameState(newState);
    return newState;
  }
  
  // Basic validation for email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(action.payload.email)) {
    console.error('Invalid email format');
    return state; // Return unchanged state if validation fails
  }
  
  // Validate password (minimum 6 characters)
  if (!action.payload.password || action.payload.password.length < 6) {
    console.error('Password must be at least 6 characters');
    return state; // Return unchanged state if validation fails
  }
  
  // Authenticate user against registered users
  const authResult = authenticateUser(action.payload.email, action.payload.password);
  
  if (!authResult.success || !authResult.user) {
    console.error('Authentication failed:', authResult.message);
    return {
      ...state,
      loginError: authResult.message
    };
  }
  
  // Create a user if login is successful
  const newUser = {
    id: authResult.user.id,
    username: authResult.user.username,
    email: authResult.user.email,
    isLoggedIn: true,
    maxCharacterSlots: 1, // Set to 1 to limit accounts to only 1 character
    gold: 1000 // Starting gold
  };
  
  // Explicitly cast the game phase to the correct type
  const nextGamePhase: GamePhase = state.activeCharacter ? 'map' : 'character-selection';
  
  const newState = {
    ...state,
    user: newUser,
    gamePhase: nextGamePhase,
    loginError: undefined
  };
  
  saveGameState(newState);
  return newState;
};

export const handleRegister = (state: GameState, action: Action): GameState => {
  if (action.type !== 'REGISTER') return state;
  
  // Registration validation is handled in the storage layer
  // If registration fails, the action payload will include an error
  if (!action.payload.success) {
    return {
      ...state,
      registrationError: action.payload.message
    };
  }
  
  return {
    ...state,
    registrationSuccess: true,
    registrationError: undefined
  };
};

export const handleLogout = (state: GameState, action: Action): GameState => {
  if (action.type !== 'LOGOUT') return state;
  
  // Reset to initial state, not just user property
  const newState = {
    characters: [],
    activeCharacter: null,
    currentEnemy: null,
    inBattle: false,
    turn: 'player' as TurnType, // Explicitly type as TurnType
    round: 1,
    battleTurn: 1, // Add battleTurn property
    gamePhase: 'menu' as GamePhase,
    temporaryEffects: {
      playerDefense: 0,
      enemyDefense: 0,
      playerBuffs: [],
      enemyBuffs: []
    },
    map: null,
    user: null,
    inBattleMode: false,
    quickAccessOpen: false,
    loginError: undefined,
    registrationError: undefined,
    registrationSuccess: undefined
  };
  
  // We don't need to saveGameState here since localStorage is cleared
  return newState;
};

export const handleBuyCharacterSlot = (state: GameState, action: Action): GameState => {
  if (action.type !== 'BUY_CHARACTER_SLOT' || !state.user) return state;
  
  // For now, we're disabling character slot purchases as we're limiting to 1 per account
  return state;
};

export const handleClearLoginError = (state: GameState, action: Action): GameState => {
  if (action.type !== 'CLEAR_LOGIN_ERROR') return state;
  
  return {
    ...state,
    loginError: undefined
  };
};

export const handleClearRegistrationStatus = (state: GameState, action: Action): GameState => {
  if (action.type !== 'CLEAR_REGISTRATION_STATUS') return state;
  
  return {
    ...state,
    registrationError: undefined,
    registrationSuccess: undefined
  };
};
