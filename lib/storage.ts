
import { GameState } from '../context/types';

const STORAGE_KEY = 'crypt_of_greed_game_state';
const SESSION_KEY = 'crypt_of_greed_user_session';
const USERS_KEY = 'crypt_of_greed_registered_users';

// Game state management
export const saveGameState = (state: GameState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);

    // If the user is logged in, save the session separately
    if (state.user?.isLoggedIn) {
      saveUserSession(state.user);
    }

    console.log('Game state saved to localStorage');
  } catch (error) {
    console.error('Failed to save game state to localStorage:', error);
  }
};

export const loadGameState = (): GameState | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) {
      // Try to recover user session if no game state is found
      const userSession = loadUserSession();
      if (userSession) {
        console.log('No game state found, but user session recovered');
        // Return a minimal state with just the user info
        return {
          characters: [],
          activeCharacter: null,
          currentEnemy: null,
          inBattle: false,
          turn: 'player',
          round: 1,
          battleTurn: 1, // Add the battleTurn property
          gamePhase: 'character-selection',
          temporaryEffects: {
            playerDefense: 0,
            enemyDefense: 0,
            playerBuffs: [],
            enemyBuffs: [],
          },
          map: null,
          user: userSession,
          inBattleMode: false,
          quickAccessOpen: false,
        };
      }
      return null;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error('Failed to load game state from localStorage:', error);
    return null;
  }
};

export const clearGameState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SESSION_KEY);
    console.log('Game state and user session cleared from localStorage');
  } catch (error) {
    console.error('Failed to clear data from localStorage:', error);
  }
};

// User session specific management
export const saveUserSession = (user: GameState['user']): void => {
  try {
    if (!user) return;
    const serializedUser = JSON.stringify(user);
    localStorage.setItem(SESSION_KEY, serializedUser);
    console.log('User session saved to localStorage');
  } catch (error) {
    console.error('Failed to save user session to localStorage:', error);
  }
};

export const loadUserSession = (): GameState['user'] | null => {
  try {
    const serializedUser = localStorage.getItem(SESSION_KEY);
    if (!serializedUser) return null;
    return JSON.parse(serializedUser);
  } catch (error) {
    console.error('Failed to load user session from localStorage:', error);
    return null;
  }
};

export const clearUserSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
    console.log('User session cleared from localStorage');
  } catch (error) {
    console.error('Failed to clear user session from localStorage:', error);
  }
};

// User registration and authentication
interface StoredUser {
  username: string;
  email: string;
  passwordHash: string;
  id: string;
}

export const registerUser = (
  username: string,
  email: string,
  password: string
): { success: boolean; message: string } => {
  try {
    // Load existing users
    const users = loadRegisteredUsers();

    // Check if email already exists
    if (users.some((user) => user.email === email)) {
      return { success: false, message: 'Email already registered' };
    }

    // Simple hash function (not secure, just for demonstration)
    const passwordHash = btoa(password); // Base64 encoding

    // Create new user
    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      username,
      email,
      passwordHash,
    };

    // Add to users array and save
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    return { success: true, message: 'Registration successful' };
  } catch (error) {
    console.error('Failed to register user:', error);
    return { success: false, message: 'Registration failed' };
  }
};

export const authenticateUser = (
  email: string,
  password: string
): {
  success: boolean;
  user?: Omit<StoredUser, 'passwordHash'>;
  message: string;
} => {
  try {
    const users = loadRegisteredUsers();

    // Find user by email
    const user = users.find((u) => u.email === email);
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    // Simple password check
    const passwordHash = btoa(password);
    if (user.passwordHash !== passwordHash) {
      return { success: false, message: 'Incorrect password' };
    }

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      success: true,
      user: userWithoutPassword,
      message: 'Authentication successful',
    };
  } catch (error) {
    console.error('Failed to authenticate user:', error);
    return { success: false, message: 'Authentication failed' };
  }
};

export const loadRegisteredUsers = (): StoredUser[] => {
  try {
    const serializedUsers = localStorage.getItem(USERS_KEY);
    if (!serializedUsers) return [];
    return JSON.parse(serializedUsers);
  } catch (error) {
    console.error('Failed to load registered users:', error);
    return [];
  }
};
