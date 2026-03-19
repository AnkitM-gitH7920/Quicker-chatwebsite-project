import "../css/login.css";
import "../css/server-responseDisplay-overlay.css";

import axios from "axios";
import validator from "validator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

import { Icon } from "@iconify/react";
import ProgressLoader from "./Loaders/ProgressLoader.jsx"

function Login() {
     // const navigate = useNavigate()

     // useState
     let [email, setEmail] = useState("");
     let [showServerResponseWindow, setShowServerResponseWindow] = useState(false);
     let [serverResponseInfo, setServerResponseInfo] = useState({});
     let [responseDisplayOptRedirectionInfo, setResponseDisplayOptRedirectionInfo] = useState({})

     // useRef
     const emailInputReference = useRef(null);
     const emailErrorContainerRef = useRef(null);
     const emailErrorInfoRef = useRef(null);
     const serverResponseDisplayReference = useRef(null);

     // ---------- Helper functions ----------
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

     // -------- Validation before submitting --------
     function handleLoginFormSubmit(event) {
          event.preventDefault();

          if (!email || !validator.isEmail(email)) {
               showEmailError("Enter a valid email address");
               return;
          }

          sendOtpMutation();
     }

     // ------ Queries and mutations -------
     const { isSuccess, data } = useQuery({
          queryKey: ["verifyLoggedInUserQuery"],
          queryFn: async () => {
               try {
                    const response = await axios.get("http://localhost:8000/v1/auth/login", { withCredentials: true });
                    return response?.data;
               } catch (axiosError) {
                    console.log("Query error :- ");
                    console.log(axiosError);
                    throw axiosError;
               }
          },
          retry: false,
          refetchOnReconnect: true,
          retryOnMount: false,
          refetchOnWindowFocus: false,
          refetchOnMount: false
     })

     if (isSuccess) {
          if (data?.redirectingURL) {
               window.location.href = data.redirectingURL;
          }
     }

     const {
          mutate: sendOtpMutation,
          isPending: isLoginRequestPending
     } = useMutation({
          mutationKey: ['sendOtpMutation'],
          mutationFn: sendOtp,
          onSuccess: (sendOtpResponse) => {
               console.log(sendOtpResponse);
               if (sendOtpResponse?.redirectingURL) {
                    window.location.href = sendOtpResponse.redirectingURL;
               }
          },
          onError: (axiosError) => {
               console.log("Error occured");
               console.log(axiosError);
               let serverErrorData = {
                    status: axiosError?.response?.data?.status ?? 500,
                    success: axiosError?.response?.data?.success ?? false,
                    message: axiosError?.response?.data?.message ?? "Something went wrong, please try again later",
                    code: axiosError?.response?.data?.code ?? "SERVER_ERROR",
                    serverData: axiosError?.response?.data?.serverData ?? null
               }
               setServerResponseInfo(serverErrorData);
               setShowServerResponseWindow(true);
               console.log(serverErrorData);
          }
     })

     async function sendOtp() {
          try {
               const response = await axios.post("http://localhost:8000/v1/auth/send-otp", {
                    email: email.trim()
               }, { withCredentials: true });
               return response?.data;
          } catch (error) {
               console.log(error);
               throw error;
          }
     }

     return (
          <div className="loginBody">

               {/* Server response overlay */}
               <div ref={serverResponseDisplayReference} className={showServerResponseWindow ? "serverResponseDisplayBg showResponseDisplay" : "serverResponseDisplayBg"}>
                    <div className="serverResponseDisplay">
                         <button
                              onClick={() => {
                                   setShowServerResponseWindow(false);
                                   setTimeout(() => {
                                        setServerResponseInfo({});
                                        setResponseDisplayOptRedirectionInfo({});
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
                         {
                              Object.keys(responseDisplayOptRedirectionInfo).length
                                   ? <a className="responseDisplayOptRedirection alignCenter" href={responseDisplayOptRedirectionInfo.redirectingURL} target="_blank">
                                        {responseDisplayOptRedirectionInfo.redirectingTitle}
                                        <Icon icon="mdi:share"></Icon>
                                   </a>
                                   : <div></div>
                         }
                    </div>
               </div>

               <div className="loginWrapper">

                    {/* Brand icon */}
                    <div className="loginIconWrap center">
                         <Icon icon="mdi:lightning-bolt" className="loginBrandIcon" />
                    </div>

                    <h2 className="loginHead">Welcome to Quickrr</h2>
                    <p className="loginSubhead">Enter your email and we'll send you a one-time code to sign in</p>

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
                                   placeholder="Enter your email"
                                   className="loginInput"
                              />
                         </div>

                         <button
                              style={{ cursor: isLoginRequestPending ? "not-allowed" : "pointer" }}
                              disabled={isLoginRequestPending}
                              type="submit"
                              className={isLoginRequestPending ? "primaryBtn notAllowed center" : "primaryBtn center"}
                         >
                              {isLoginRequestPending ? <ProgressLoader /> : (
                                   <span className="alignCenter btnInner">
                                        Send OTP
                                        <Icon icon="mdi:arrow-right-thick" />
                                   </span>
                              )}
                         </button>

                    </form>

                    {/* Trust line */}
                    <p className="loginTrustLine">
                         <Icon icon="mdi:shield-check-outline" />
                         No password needed. Ever.
                    </p>

                    <div className="divider">
                         <span>OR</span>
                    </div>

                    <div className="socialBtns">
                         <button className="googleBtn">
                              <img src="src/assets/googleLogo.png" loading="lazy" alt="google" />
                              Continue with Google
                         </button>
                    </div>

               </div>
          </div>
     );
}

export default Login;
