import "./login.css";
import "../../css/server-responseDisplay-overlay.css";

import axios from "axios";
import validator from "validator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";


import { Icon } from "@iconify/react";
import ProgressLoader from "../Loaders/ProgressLoader.jsx"

function Login() {
    const navigate = useNavigate()

    // useState
    let [email, setEmail] = useState("");
    let [password, setPassword] = useState("");
    let [isPasswordVisible, setIsPasswordVisible] = useState(false);
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


    // ---------- Helpers ----------
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

    // ---------- Live Email Validation ----------
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

    // ---------- Live Password Validation ----------
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


    // -------- Validation before submitting --------
    function handleLoginFormSubmit(event) {
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

        loginUserMutation();
    }

    // ------ Queries and mutations -------
    const { isSuccess, data, isError, error } = useQuery({
        queryKey: ["verifyLoggedInUserQuery"],
        queryFn: async () => {
            try {
                const response = await axios.get("http://localhost:8000/v1/auth/login", { withCredentials: true });
                return response?.data;

            } catch (axiosError) { throw axiosError }
        },
        retry: false,
        refetchOnReconnect: true,
        retryOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    })
    if(isSuccess) {
        if(data?.redirectingURL){
            window.location.href = data.redirectingURL;
        }
    }

    const {
        mutate: loginUserMutation,
        isPending: isLoginRequestPending
    } = useMutation({
        mutationKey: ['loginUserMutation'],
        mutationFn: loginUser,
        onSuccess: (loginUserResponse) => {
            console.log("Success")
            console.log(loginUserResponse)

            if (loginUserResponse?.redirectingURL) {
                window.location.href = loginUserResponse.redirectingURL
            }
        },
        onError: (axiosLoginError) => {
            console.log("Error occured")
            console.log(axiosLoginError)
            let serverErrorData = {
                status: axiosLoginError?.response?.data?.status ?? 500,
                success: axiosLoginError?.response?.data?.success ?? false,
                message: axiosLoginError?.response?.data?.message ?? "Something went wrong, please try again later",
                code: axiosLoginError?.response?.data?.code ?? "SERVER_ERROR",
                serverData: axiosLoginError?.response?.data?.serverData ?? null
            }
            if (serverErrorData.status === 404) {
                setServerResponseInfo(serverErrorData)
                setResponseDisplayOptRedirectionInfo({
                    redirectingURL: "http://localhost:5173/signup",
                    redirectingTitle: "Register Now"
                })
                setShowServerResponseWindow(true);
                return;
            }

            setServerResponseInfo(serverErrorData)
            setShowServerResponseWindow(true);

            console.log(serverErrorData);
        }
    })

    async function loginUser() {
        try {
            const loginResponse = await axios.post("http://localhost:8000/v1/auth/login", {
                email: email.trim(),
                password: password.trim()
            }, { withCredentials: true });

            return loginResponse?.data;

        } catch (loginError) { throw loginError }
    }
    return (
        <div className="loginBody">

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

            <div className="loginWrapper">
                <h2 className="loginHead">Welcome back !!!</h2>

                <form onSubmit={handleLoginFormSubmit} autoComplete="off" className="loginForm">

                    {/* Email Error */}
                    <div ref={emailErrorContainerRef} className="errorContainer" style={{ display: "none" }}>
                        <span ref={emailErrorInfoRef} className="errorInfo"></span>
                    </div>

                    <div className="inputBox alignCenter">
                        <Icon icon="mdi:email-outline" className="icon" />
                        <input
                            ref={emailInputReference}
                            value={email}
                            onChange={(event) => setEmail((event.target.value).trim())}
                            type="text"
                            placeholder="Enter registered email"
                            className="loginInput"
                        />
                    </div>

                    {/* Password Error */}
                    <div ref={passwordErrorContainerRef} className="errorContainer" style={{ display: "none" }}>
                        <span ref={passwordErrorInfoRef} className="errorInfo"></span>
                    </div>

                    <div className="inputBox alignCenter">
                        <Icon icon="mdi:lock-outline" className="icon" />
                        <input
                            ref={passwordInputReference}
                            value={password}
                            onChange={(event) => setPassword((event.target.value).trim())}
                            type={isPasswordVisible ? "text" : "password"}
                            placeholder="Enter password"
                            className="loginInput"
                        />
                        <button
                            type="button"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            className="eyeBtn center"
                        >
                            <img
                                src={isPasswordVisible ? "src/assets/hide.png" : "src/assets/view.png"}
                                loading="lazy"
                                alt="toggle"
                            />
                        </button>
                    </div>

                    <button style={{ cursor: isLoginRequestPending ? "not-allowed" : "pointer" }} disabled={isLoginRequestPending} type="submit" className={isLoginRequestPending ? "primaryBtn notAllowed center" : "primaryBtn center"}>{isLoginRequestPending ? <ProgressLoader /> : "Login"}</button>
                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <div className="socialBtns">
                    <button onClick={() => loginWithGoogleMutation()} className="googleBtn">
                        <img src="src/assets/googleLogo.png" loading="lazy" alt="google" />
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;