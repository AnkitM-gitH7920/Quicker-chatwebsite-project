import "../css/signup.css";
import "../css/server-responseDisplay-overlay.css";

// Library imports
import validator from "validator";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Components imports
import { Icon } from "@iconify/react";
import ProgressLoader from "../client/src/components/Loaders/ProgressLoader.jsx";


function Signup() {
    const navigate = useNavigate();

    // useState
    let [isPasswordVisible, setIsPasswordVisible] = useState(false);
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [showServerResponseWindow, setShowServerResponseWindow] = useState(false);
    let [serverResponseInfo, setServerResponseInfo] = useState({});
    let [responseDisplayOptRedirectionInfo, setResponseDisplayOptRedirectionInfo] = useState({})

    // useRef
    const emailInputReference = useRef(null);
    const passwordInputReference = useRef(null);
    const emailErrorContainerRef = useRef(null);
    const emailErrorInfoRef = useRef(null);
    const passwordErrorContainerRef = useRef(null);
    const passwordErrorInfoRef = useRef(null);
    const serverResponseDisplayReference = useRef(null);
    
    // HANDLES :- Live Email Validation
    useEffect(() => {
        if (!email) {
            hideEmailError();
            return;
        }

        if (!validator.isEmail(email)) {
            showEmailError("Enter a valid email address");
        } else {
            hideEmailError();
        }
    }, [email]);

    useEffect(() => {
        if (!password) {
            hidePasswordError();
            return;
        }

        if (password.length < 8) {
            showPasswordError("Password must be at least 8 characters");
            return;
        }

        if (!/[!@#$%^&*()_\-+=\[\]{};:'\",.<>/?\\|]/.test(password)) {
            showPasswordError("Add at least one special character (!@#$ etc.)");
            return;
        }

        if (!/[A-Z]/.test(password)) {
            showPasswordError("Add at least one capital letter (A-Z)");
            return;
        }

        if (!/[0-9]/.test(password)) {
            showPasswordError("Add at least one number (0-9)");
            return;
        }

        hidePasswordError();
    }, [password]);

    // -------- Queries and mutations ----------
    let { data, isSuccess, error, isError } = useQuery({
        queryKey: ['checkSessionQuery'],
        queryFn: async () => {

            try {
                const serverResponse = await axios.get("http://localhost:8000/v1/auth/signup", { withCredentials: true });
                return serverResponse?.data;

            } catch (axiosError) {
                throw axiosError;
            }
        },
        retry: false,
        refetchOnReconnect: true,
        retryOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    })
    // if (isError) { console.log(error.response?.data) }
    if (isSuccess) {
        // console.log(data);
        if ((data.redirectingURL !== null || data.redirectingURL !== undefined) || data.redirectingURL) {
            window.location.href = data.redirectingURL;
        }
    }

    let {
        mutate: registerUserMutation,
        isPending: isRegisterUserRequestPending
    } = useMutation({
        mutationKey: ['registerUserMutation'],
        mutationFn: registerUser,
        onSuccess: (registerUserResponse) => {
            console.log(registerUserResponse);
            let serverSuccessData = {
                status: registerUserResponse?.status,
                message: registerUserResponse?.message,
                code: "SUCCESS",
                data: registerUserResponse?.serverData || null
            }
            setServerResponseInfo(serverSuccessData)
            setResponseDisplayOptRedirectionInfo({
                redirectingURL: "http://localhost:5173/login",
                redirectingTitle: "Login Now"
            })
            setShowServerResponseWindow(true);
            console.log(serverSuccessData);
        },
        onError: (registerUserError) => {
            console.log(registerUserError);
            let serverErrorData = {
                status: registerUserError?.response?.data?.status ?? 500,
                success: registerUserError?.response?.data?.success ?? false,
                message: registerUserError?.response?.data?.message ?? "Something went wrong, please try again later",
                code: registerUserError?.response?.data?.code ?? "SERVER_ERROR",
                serverData: registerUserError?.response?.data?.serverData ?? null
            }

            if (serverErrorData.status === 409) {
                setResponseDisplayOptRedirectionInfo({
                    redirectingURL: "http://localhost:5173/login",
                    redirectingTitle: "Login Now"
                })
                setServerResponseInfo(serverErrorData)
                setShowServerResponseWindow(true);

                return;
            }

            setServerResponseInfo(serverErrorData)
            setShowServerResponseWindow(true);
        }
    })

    let {
        mutate: oAuthSignupMutation,
        isPending: isOAuthPending
    } = useMutation({
        mutationFn: () => {
            window.location.href = "http://localhost:8000/v1/auth/google"
        }
    })

    // async functions
    async function registerUser() {
        try {
            let registerUserResponse = await axios.post(`http://localhost:8000/v1/auth/signup`, {
                email: email.trim(),
                password: password.trim()

            }, { withCredentials: true })

            return registerUserResponse?.data;

        } catch (registerError) {
            throw registerError;
        }
    }

    // sync functions
    function handleSubmit(event) {
        event.preventDefault();

        let hasError = false;

        if (!email || !validator.isEmail(email)) {
            showEmailError("Enter a valid email address");
            hasError = true;
        }

        if (
            !password ||
            password.length < 8 ||
            !/[!@#$%^&*()_\-+=\[\]{};:'\",.<>/?\\|]/.test(password) ||
            !/[A-Z]/.test(password) ||
            !/[0-9]/.test(password)
        ) {
            showPasswordError("Password does not meet requirements");
            hasError = true;
        }

        if (hasError) return;

        registerUserMutation();
    }
    // ---------- Helpers functions ----------
    function showEmailError(msg) {
        emailInputReference.current?.classList.add("errorWarning");
        emailErrorContainerRef.current.style.display = "block";
        emailErrorInfoRef.current.textContent = msg;
    }

    function hideEmailError() {
        emailInputReference.current?.classList.remove("errorWarning");
        emailErrorContainerRef.current.style.display = "none";
        emailErrorInfoRef.current.textContent = "";
    }

    function showPasswordError(msg) {
        passwordInputReference.current?.classList.add("errorWarning");
        passwordErrorContainerRef.current.style.display = "block";
        passwordErrorInfoRef.current.textContent = msg;
    }

    function hidePasswordError() {
        passwordInputReference.current?.classList.remove("errorWarning");
        passwordErrorContainerRef.current.style.display = "none";
        passwordErrorInfoRef.current.textContent = "";
    }

    return (
        <div className="signupBody">

            {/* Pop down to display server success response */}
            <div ref={serverResponseDisplayReference} className={showServerResponseWindow ? "serverResponseDisplayBg showResponseDisplay" : "serverResponseDisplayBg"} >
                <div className="serverResponseDisplay">
                    <button
                        onClick={() => {
                            setShowServerResponseWindow(false);
                            setTimeout(() => {
                                setServerResponseInfo({});
                                setResponseDisplayOptRedirectionInfo({})
                            }, 300);
                        }}
                        className="collapseResponseDisplay center">
                        <Icon icon="mdi:close"></Icon>
                    </button>
                    <div className="responseDisplayHead">
                        <span className="textCode">{serverResponseInfo.code}</span>
                        <span className="statusCode">{serverResponseInfo.status}</span>
                    </div>
                    <p className="responseMessage">
                        {serverResponseInfo.message}
                    </p>
                    {/* optional redirecting url */}
                    {
                        Object.keys(responseDisplayOptRedirectionInfo).length ? <a className="responseDisplayOptRedirection alignCenter" href={responseDisplayOptRedirectionInfo.redirectingURL} target="_blank">{responseDisplayOptRedirectionInfo.redirectingTitle}<Icon icon="mdi:share"></Icon></a> : <div></div>
                    }

                </div>
            </div>

            <div className="signupWrapper">
                <h2 className="signupHead">Create your account</h2>

                <form onSubmit={handleSubmit} autoComplete="off" className="signupForm">
                    <div ref={emailErrorContainerRef} className="errorContainer" style={{ display: "none" }}>
                        <span ref={emailErrorInfoRef} className="errorInfo">Some error information error</span>
                    </div>
                    <div className="inputBox alignCenter">
                        <Icon icon="mdi:email-outline" className="icon" />
                        <input
                            ref={emailInputReference}
                            value={email}
                            onChange={(event) => setEmail((event.target.value).trim())}
                            type="text"
                            placeholder="Enter your email address"
                            className="signupInput "
                            autoComplete="false"
                        />
                    </div>

                    <div ref={passwordErrorContainerRef} className="errorContainer" style={{ display: "none" }}>
                        <span ref={passwordErrorInfoRef} className="errorInfo">Some error information error</span>
                    </div>
                    <div className="inputBox alignCenter">
                        <Icon icon="mdi:lock-outline" className="icon" />
                        <input
                            ref={passwordInputReference}
                            value={password}
                            onChange={(event) => setPassword((event.target.value).trim())}
                            type={isPasswordVisible ? "text" : "password"}
                            placeholder="Enter password"
                            className="signupInput"
                            autoComplete="false"
                        />
                        <button onClick={() => { setIsPasswordVisible(!isPasswordVisible) }} type="button" className="eyeBtn center">
                            <img src={isPasswordVisible ? "src/assets/hide.png" : "src/assets/view.png"} loading="lazy" alt="Error..." />
                        </button>
                    </div>

                    <button style={{ cursor: isRegisterUserRequestPending ? "not-allowed" : "pointer" }} disabled={isRegisterUserRequestPending} type="submit" className={isRegisterUserRequestPending ? "primaryBtn notAllowed center" : "primaryBtn center"}>{isRegisterUserRequestPending ? <ProgressLoader /> : "Register"}</button>
                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <div className="socialBtns">
                    <button style={{ cursor: isOAuthPending ? "not-allowed" : "pointer" }} onClick={() => { oAuthSignupMutation() }} className="googleBtn">
                        <img src="src/assets/googleLogo.png" alt="google" />
                        Continue with Google
                    </button>
                </div>
            </div>
        </div >
    );
}
export default Signup;
