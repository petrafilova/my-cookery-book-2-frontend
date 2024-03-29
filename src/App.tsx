import { Fragment, useContext, useEffect, useState } from 'react';
import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { Button, Container, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import './App.scss';
import { AuthContext } from './store/auth-context';
import SignInPage from './pages/SignInPage';
import UsersPage from './pages/UsersPage';
import UnitsPage from './pages/UnitsPage';
import TagsPage from './pages/TagsPage';
import ProfilePage from './pages/ProfilePage';
import CategoryPage from './pages/CategoryPage';
import RecipePage from './pages/RecipePage';
import { authApi, categoryApi } from './utils/apiWrapper';
import { Api } from './openapi';
import UserPage from './pages/UserPage';
import CategoriesPage from './pages/CategoriesPage';
import TagPage from './pages/TagPage';
import UnitCategoryPage from './pages/UnitCategoryPage';
import UnitPage from './pages/UnitPage';
import RecipesPage from './pages/RecipesPage';
import RecipeViewPage from './pages/RecipeViewPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowRightFromBracket,
    faList,
    faPizzaSlice,
    faScaleBalanced,
    faTags,
    faUser,
    faUsers,
    faUtensils
} from '@fortawesome/free-solid-svg-icons';
import CookieConsent from 'react-cookie-consent';
import { formatErrorMessage } from './utils/errorMessages';
import Spinner from './components/UI/Spinner';
import Modal from './components/UI/Modal';
import ConfirmationPage from './pages/ConfirmationPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ResetPasswordRequestPage from './pages/ResetPasswordRequestPage';
import { RecipeState } from './components/Recipes/Recipes';
import { useQuery } from '@tanstack/react-query';

function App() {
    const authCtx = useContext(AuthContext);
    const isLoggedIn = authCtx.isLoggedIn;
    const [expanded, setExpanded] = useState(false);
    const [error, setError] = useState<string>();

    const [resetValues, setResetValues] = useState<RecipeState>({
        searchingText: '',
        searchingCategory: undefined,
        selectedTags: [],
        currentPage: 1,
        order: Api.RecipeSearchCriteria.OrderEnum.ASC,
        orderBy: Api.RecipeSearchCriteria.OrderByEnum.Name
    });

    const {
        data: userInfo,
        isFetching: isFetchingUserInfo,
        error: userInfoError
    } = useQuery({
        queryKey: ['currentUser'],
        queryFn: ({ signal }) => authApi.user({ signal }),
        enabled: isLoggedIn
    });

    useEffect(() => {
        if (userInfoError) {
            formatErrorMessage(userInfoError).then((message) => setError(message));
        }
    }, [userInfoError]);

    const {
        data: listOfCategories,
        isFetching: isFetchingListOfCategories,
        error: listOfCategoriesError
    } = useQuery({
        queryKey: ['categories'],
        queryFn: ({ signal }) =>
            categoryApi.getCategories({ signal }).then((data) =>
                data.sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, {
                        sensitivity: 'base'
                    })
                )
            ),
        enabled: isLoggedIn
    });

    useEffect(() => {
        if (listOfCategoriesError) {
            formatErrorMessage(listOfCategoriesError).then((message) => setError(message));
        }
    }, [listOfCategoriesError]);

    let username = `${userInfo?.firstName ?? ''} ${userInfo?.lastName ?? ''}`.trim();
    if (!username) {
        username = userInfo?.username ?? '';
    }

    const openOffcanvas = () => {
        setExpanded(true);
    };

    const closeOffcanvas = () => {
        setExpanded(false);
    };

    const logoutHandler = () => {
        authCtx.logout();
    };

    const setStateHandler = (categoryId: number) => {
        setResetValues((prev) => {
            return { ...prev, searchingCategory: categoryId };
        });
        closeOffcanvas();
    };

    return (
        <>
            <CookieConsent
                location='bottom'
                buttonText='Súhlasím'
                containerClasses='bg-primary'
                buttonClasses='btn btn-warning rounded m-2'
                disableButtonStyles={true}
                overlay={true}
            >
                Aplikácia pre svoju funkčnosť vyžaduje uložiť v Local Storage prehliadača informáciu o aktuálne prihlásenom používateľovi.
                Zapamätanie súhlasu aplikácia ukladá do Cookies prehliadača. Používaním aplikácie súhlasíte s ukladaním týchto informácií vo
                vašom internetovom prehliadači. Pri odhlásení dôjde k vymazaniu záznamu v Local Storage o prihlásenom používateľovi.
            </CookieConsent>
            {isLoggedIn && (
                <Navbar
                    bg='primary'
                    variant='dark'
                    expand={false}
                    expanded={expanded}
                >
                    <Container fluid>
                        <Navbar.Toggle onClick={openOffcanvas} />
                        <Navbar.Brand
                            as={Link}
                            to='/recipes'
                        >
                            Kuchárska kniha
                        </Navbar.Brand>
                        <Button
                            onClick={logoutHandler}
                            aria-label='Odhlásiť sa'
                        >
                            <FontAwesomeIcon
                                className='d-lg-none'
                                icon={faArrowRightFromBracket}
                                title='Odhlásiť sa'
                                aria-hidden='true'
                            />
                            <span className='d-none d-lg-inline'>Odhlásiť sa</span>
                        </Button>
                        <Navbar.Offcanvas
                            placement='start'
                            onHide={closeOffcanvas}
                        >
                            <Offcanvas.Header closeButton>
                                <Offcanvas.Title>{username}</Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body>
                                <Nav>
                                    <Nav.Link
                                        to='/profile'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        <FontAwesomeIcon
                                            style={{ width: 20 }}
                                            icon={faUser}
                                        />{' '}
                                        Profil
                                    </Nav.Link>
                                    {authCtx.userRoles.find((role) => role === Api.User.RoleEnum.ADMIN) && (
                                        <Nav.Link
                                            to='/users'
                                            as={Link}
                                            onClick={closeOffcanvas}
                                        >
                                            <FontAwesomeIcon
                                                style={{ width: 20 }}
                                                icon={faUsers}
                                            />{' '}
                                            Používatelia
                                        </Nav.Link>
                                    )}
                                    <Nav.Link
                                        to='/categories'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        <FontAwesomeIcon
                                            style={{ width: 20 }}
                                            icon={faList}
                                        />{' '}
                                        Kategórie
                                    </Nav.Link>
                                    <Nav.Link
                                        to='/units'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        <FontAwesomeIcon
                                            style={{ width: 20 }}
                                            icon={faScaleBalanced}
                                        />{' '}
                                        Jednotky
                                    </Nav.Link>
                                    <Nav.Link
                                        to='/tags'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        <FontAwesomeIcon
                                            style={{ width: 20 }}
                                            icon={faTags}
                                        />{' '}
                                        Značky
                                    </Nav.Link>
                                    {authCtx.userRoles.find(
                                        (role) => role === Api.User.RoleEnum.ADMIN || role === Api.User.RoleEnum.CREATOR
                                    ) && (
                                        <Nav.Link
                                            to='/recipe/create'
                                            as={Link}
                                            onClick={closeOffcanvas}
                                        >
                                            <FontAwesomeIcon
                                                style={{ width: 20 }}
                                                icon={faPizzaSlice}
                                            />{' '}
                                            Pridať recept
                                        </Nav.Link>
                                    )}
                                    <hr />
                                    <Nav.Link
                                        to='/recipes'
                                        as={Link}
                                        onClick={closeOffcanvas}
                                    >
                                        <FontAwesomeIcon
                                            style={{ width: 20 }}
                                            icon={faUtensils}
                                        />{' '}
                                        Všetky recepty
                                    </Nav.Link>
                                    <hr />
                                    {listOfCategories?.map((category) => (
                                        <Nav.Link
                                            to={`/recipes/${category.id}`}
                                            state={resetValues}
                                            as={Link}
                                            onClick={() => setStateHandler(category.id)}
                                            key={category.id}
                                        >
                                            {category.name}
                                        </Nav.Link>
                                    ))}
                                </Nav>
                            </Offcanvas.Body>
                        </Navbar.Offcanvas>
                    </Container>
                </Navbar>
            )}
            <Container
                as={'main'}
                className='py-4'
            >
                <Routes>
                    {isLoggedIn ? (
                        <Fragment>
                            <Route
                                path='/profile'
                                element={<ProfilePage />}
                            />
                            <Route
                                path='/users'
                                element={<UsersPage />}
                            />
                            <Route
                                path='/user'
                                element={<UserPage />}
                            />
                            <Route
                                path='/user/:id'
                                element={<UserPage />}
                            />
                            <Route
                                path='/categories'
                                element={<CategoriesPage />}
                            />
                            <Route
                                path='/category'
                                element={<CategoryPage />}
                            />
                            <Route
                                path='/category/:id'
                                element={<CategoryPage />}
                            />
                            <Route
                                path='/tags'
                                element={<TagsPage />}
                            />
                            <Route
                                path='/tag'
                                element={<TagPage />}
                            />
                            <Route
                                path='/tag/:id'
                                element={<TagPage />}
                            />
                            <Route
                                path='/units'
                                element={<UnitsPage />}
                            />
                            <Route
                                path='/unit/:categoryId/'
                                element={<UnitPage />}
                            />
                            <Route
                                path='/unit/:categoryId/:unitId'
                                element={<UnitPage />}
                            />
                            <Route
                                path='/unitCategory'
                                element={<UnitCategoryPage />}
                            />
                            <Route
                                path='/unitCategory/:id'
                                element={<UnitCategoryPage />}
                            />
                            <Route
                                path='/recipe/create'
                                element={<RecipePage />}
                            />
                            <Route
                                path='/recipe/:recipeId'
                                element={<RecipePage />}
                            />
                            <Route
                                path='/recipe/display/:recipeId'
                                element={<RecipeViewPage />}
                            />
                            <Route
                                path='/recipes'
                                element={<RecipesPage />}
                            />
                            <Route
                                path='/recipes/:categoryId/'
                                element={<RecipesPage />}
                            />
                        </Fragment>
                    ) : (
                        <Route
                            path='/signIn'
                            element={<SignInPage />}
                        />
                    )}
                    <Route
                        path='/confirm'
                        element={<ConfirmationPage />}
                    />
                    <Route
                        path='/confirm/:username/:key'
                        element={<ConfirmationPage />}
                    />
                    <Route
                        path='/resetRequest'
                        element={<ResetPasswordRequestPage />}
                    />
                    <Route
                        path='/reset'
                        element={<ResetPasswordPage />}
                    />
                    <Route
                        path='/reset/:username/:key'
                        element={<ResetPasswordPage />}
                    />
                    <Route
                        path='*'
                        element={
                            <Navigate
                                replace
                                to={isLoggedIn ? '/recipes' : '/signIn'}
                            />
                        }
                    />
                </Routes>
            </Container>
            <Modal
                show={!!error}
                message={error}
                type='error'
                onClose={() => {
                    setError(undefined);
                }}
            />
            {(isFetchingListOfCategories || isFetchingUserInfo) && <Spinner />}
        </>
    );
}

export default App;
