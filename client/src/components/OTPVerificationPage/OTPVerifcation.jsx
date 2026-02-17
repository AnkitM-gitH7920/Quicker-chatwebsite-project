import "./otp-verification.css";
import "../../css/server-responseDisplay-overlay.css";

import ProgressLoader from "../Loaders/ProgressLoader";
import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";

function OTPVerificationPage() {
    let serverResponseDisplayReference = useRef(null);
    let otpInputReference = useRef(null);
    let otpErrorContainerRef = useRef(null);
    let otpErrorInfoRef = useRef(null);

    let [OTP, setOTP] = useState("");
    let [isOTPVisible, setIsOTPVisible] = useState(false);
    let [showServerResponseWindow, setShowServerResponseWindow] = useState(false);
    let [serverResponseInfo, setServerResponseInfo] = useState({});
    let [responseDisplayOptRedirectionInfo, setResponseDisplayOptRedirectionInfo] = useState({});

    useEffect(() => {
        if (!OTP) {
            hideOTPError();
            return;
        }

        if (OTP.length < 6) {
            showOTPError("OTP should contain only 6 digits");
            return;
        }

        if (!/[0-9]/.test(OTP)) {
            showOTPError("Add at least one number (0-9)");
            return;
        }

        if (OTP.length === 6) {
            hideOTPError();
            return;
        }

        hideOTPError();
    }, [OTP]);


    // queries and mutations
    const { isPending, isError, error, isSuccess, data } = useQuery({
        queryKey: ['otpSessionCheckingQuery'],
        queryFn: async () => {
            try {
                const response = await axios.get("http://localhost:8000/v1/auth/login/request-otp", { withCredentials: true });
                return response?.data;

            } catch (axiosError) {
                throw axiosError
            }
        },
        retry: false,
        retryOnMount: false,
        refetchIntervalInBackground: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false
    })
    const {
        mutate: otpMutation,
        isPending: isOTPMutationPending
    } = useMutation({
        mutationKey: ['otpVerificationMutation'],
        mutationFn: async () => {
            try {
                const response = await axios.post("http://localhost:8000/v1/auth/login/verify-otp", { enteredOTP: OTP }, { withCredentials: true });
                return response?.data;

            } catch (axiosError) { throw axiosError }
        },
        onSuccess: (data) => {
            if (data?.redirectingURL) {
                window.location.href = data.redirectingURL
            }
        },
        onError: (error) => {

            // For any Authorization related errors
            if (error.response?.data?.status === 401 || error.response?.data?.status === 410) {
                setServerResponseInfo({
                    code: error.response?.data?.code,
                    status: error.response?.data?.status,
                    message: error.response?.data?.message,
                });
                setResponseDisplayOptRedirectionInfo({
                    redirectingTitle: "Login now",
                    redirectingURL: "http://localhost:5173/login"
                });
                setShowServerResponseWindow(true);
                return;
            }

            // for incorrect OTP
            if (error.response?.data?.status === 400 && error.response?.data?.code === "INVALID_OTP") {
                showOTPError("Please enter a valid OTP");
                return;
            }

            setServerResponseInfo({
                code: error.response?.data?.code || "UNKNOWN_ERROR",
                status: error.response?.data?.status || 500,
                message: error.response?.data?.message || "Some unexpected error occured, cannot verify OTP at the moment",
            });
            setShowServerResponseWindow(true);
        }
    })


    // Normal functions 
    function showOTPError(msg) {
        otpInputReference.current?.classList.add("errorWarning");
        otpErrorContainerRef.current.style.display = "block";
        otpErrorInfoRef.current.textContent = msg;
    }

    function hideOTPError() {
        otpInputReference.current?.classList.remove("errorWarning");
        otpErrorContainerRef.current.style.display = "none";
        otpErrorInfoRef.current.textContent = "";
    }

    function handleOTPSubmit(event) {
        event.preventDefault();

        let hasError = false;

        if (
            !OTP ||
            OTP.length < 6 ||
            !/[0-9]/.test(OTP)
        ) {
            showOTPError("OTP does not meet requirements");
            hasError = true;
        }

        if (hasError) return;

        //Submit otp verification request
        otpMutation();
    }
    return (
        <div className="otpPageBody">

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
            <div className="otpPageWrapper">
                <h2 className="otpPageHead">Verify OTP</h2>

                <form autoComplete="off" onSubmit={handleOTPSubmit} className="otpForm">

                    {/* OTP Error */}
                    <div ref={otpErrorContainerRef} className="errorContainer" style={{ display: "none" }}>
                        <span ref={otpErrorInfoRef} className="errorInfo"></span>
                    </div>
                    <div className="inputBox alignCenter">
                        <Icon icon="mdi:lock-outline" className="icon" />
                        <input
                            value={OTP}
                            onChange={(event) => {
                                const value = event.target.value.replace(/\D/g, "");
                                setOTP(value.slice(0, 6));
                            }}
                            type={isOTPVisible ? "text" : "password"}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Enter 6-digit OTP"
                            className={isPending ? "notAllowed OTPInput" : "OTPInput"}
                            disabled={isPending}
                            maxLength={6}
                            ref={otpInputReference}
                        />
                        <button
                            type="button"
                            onClick={() => setIsOTPVisible(!isOTPVisible)}
                            className="eyeBtn center"
                        >
                            <img
                                src={isOTPVisible ? "src/assets/hide.png" : "src/assets/view.png"}
                                loading="lazy"
                                alt="toggle"
                            />
                        </button>
                    </div>

                    <button
                        disabled={isOTPMutationPending || isPending}
                        type="submit"
                        style={{cursor: (isOTPMutationPending || isPending) ? "not-allowed" : "pointer"}}
                        className={(isOTPMutationPending || isPending) ? "primaryBtn notAllowed center" : "primaryBtn center"}>
                        {isOTPMutationPending ? <ProgressLoader /> : "Verify"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default OTPVerificationPage;