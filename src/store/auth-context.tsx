import React, { useState, useEffect, PropsWithChildren } from 'react';
import jwt_decode, { JwtPayload } from 'jwt-decode';
import { authApi, userApi } from '../utils/apiWrapper';
import { formatErrorMessage } from '../utils/errorMessages';
import Modal from '../components/UI/Modal';
import Spinner from '../components/UI/Spinner';
import { Api } from '../openapi';

type AuthContextObj = {
    userId: number | null;
    // userRoles: Api.User.RolesEnum[];
    isLoggedIn: boolean;
    login: (token: string, refreshToken: string) => void;
    logout: () => void;
};

type CustomToken = {
    userId: number;
    roles?: string[];
    refresh?: boolean;
} & JwtPayload;

export const AuthContext = React.createContext<AuthContextObj>({
    userId: null,
    // userRoles: [],
    isLoggedIn: false,
    login: () => {},
    logout: () => {},
});

const tokenValidity = (token: string | null) => {
    if (token === null) {
        return -1;
    }
    const decoded = jwt_decode<CustomToken>(token);
    if (!decoded.exp) {
        return -1;
    }
    const tokenValidity = decoded.exp * 1000 - Date.now();
    return tokenValidity - 60000;
};

const storedToken = localStorage.getItem('token');
const storedRefreshToken = localStorage.getItem('refreshToken');

const AuthContextProvider: React.FC<PropsWithChildren> = (props) => {
    const [token, setToken] = useState(
        tokenValidity(storedToken) > 0 ? storedToken : null
    );
    const [refreshToken, setRefreshToken] = useState(
        tokenValidity(storedRefreshToken) > 0 ? storedRefreshToken : null
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>();
    const [userId, setUserId] = useState(() => {
        if (token) {
            const decodedToken = jwt_decode<CustomToken>(token);
            return decodedToken.userId;
        } else {
            return null;
        }
    });
    // const [userRoles, setUserRoles] = useState<Api.User.RolesEnum[]>([]);

    const userIsLoggedIn = !!token;

    useEffect(() => {
        const tokenIsValid = tokenValidity(token) > 0;
        const refreshTokenIsValid = tokenValidity(refreshToken) > 0;
        if (tokenIsValid && refreshTokenIsValid) {
            const interval = setTimeout(() => {
                (async () => {
                    if (refreshToken) {
                        try {
                            setIsLoading(true);
                            const data = await authApi.refreshToken({
                                refreshToken,
                            });
                            if (data) {
                                loginHandler(data.token, data.refreshToken);
                            }
                            if (!data) {
                                logoutHandler();
                            }
                        } catch (err) {
                            formatErrorMessage(err).then((message) =>
                                setError(message)
                            );
                        } finally {
                            setIsLoading(false);
                        }
                    }
                })();
            }, tokenValidity(token));
            return () => {
                clearInterval(interval);
            };
        } else if (refreshTokenIsValid) {
            (async () => {
                if (refreshToken) {
                    try {
                        setIsLoading(true);
                        const data = await authApi.refreshToken({
                            refreshToken,
                        });
                        if (data) {
                            loginHandler(data.token, data.refreshToken);
                        }
                        if (!data) {
                            logoutHandler();
                        }
                    } catch (err) {
                        formatErrorMessage(err).then((message) =>
                            setError(message)
                        );
                    } finally {
                        setIsLoading(false);
                    }
                }
            })();
        } else {
            logoutHandler();
        }
    }, [token, refreshToken, userId]);

    // useEffect(() => {
    //     console.log('som tu');
    //     (async () => {
    //         if (userId) {
    //             console.log('som tu2', userId);
    //             const data = await userApi.getUser(userId);
    //             console.log(data)
    //             setUserRoles(data.roles)
    //         }
    //         try {
    //             setIsLoading(true);
    //         } catch (err) {
    //             formatErrorMessage(err).then((message) => setError(message));
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     })();
    // }, [userId]);

    const loginHandler = (token: string, refreshToken: string) => {
        setToken(token);
        setRefreshToken(refreshToken);
        const decodedToken = jwt_decode<CustomToken>(token);
        setUserId(decodedToken?.userId);
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
    };

    const logoutHandler = () => {
        setToken(null);
        setRefreshToken(null);
        setUserId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    };

    const contextValue: AuthContextObj = {
        userId: userId,
        // userRoles: userRoles,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout: logoutHandler,
    };

    return (
        <>
            <AuthContext.Provider value={contextValue}>
                {props.children}
            </AuthContext.Provider>
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
            {isLoading && <Spinner />}
        </>
    );
};

export default AuthContextProvider;
