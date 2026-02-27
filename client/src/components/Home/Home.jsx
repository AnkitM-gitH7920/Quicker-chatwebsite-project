import "../../css/utilities.css";
import "../../css/Home.css";
import "../../css/App.css";
import "../../css/server-responseDisplay-overlay.css";
import "tippy.js/animations/scale.css";

import axiosAPI from "../../utils/axiosInterceptor.utils.js";
import Tippy from "@tippyjs/react";
import ChatListSkeleton from "../Loaders/SkeletonLoaders/ChatListSkeleton/ChatListSkeleton.jsx";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";

// ! Pending Tasks :-
// ? if the user name is to big then give it a ... at the end
// ? if the recent chat user name is to big then give it a ... at the end


function UserDashboard() {
     // useState(s)
     let [message, setMessage] = useState("");
     let [isNetworkError, setIsNetworkError] = useState(false);
     let [showServerResponseWindow, setShowServerResponseWindow] = useState(false);
     let [serverResponseInfo, setServerResponseInfo] = useState({});
     let [responseDisplayOptRedirectionInfo, setResponseDisplayOptRedirectionInfo] = useState({});

     // useRef(s)
     let chatOperationsBox = useRef(null);
     let selectedChatOptionDropDown = useRef(null);
     let addAttachmentSvgReference = useRef(null);
     let addAttachmentsBoxReference = useRef(null);
     let serverResponseDisplayReference = useRef(null);

     //queries
     const {
          isSuccess,
          data,
          isError,
          error,
          isPending
     } = useQuery({
          queryKey: ["getUserData"],
          queryFn: getHomePageUserData,
          refetchOnWindowFocus: false,
          retryOnMount: false,
          refetchOnMount: false

     })
     if (isSuccess) console.log(data);
     if (isError) console.log(error);
     if (isPending) console.log("Query is pending...");

     // async functions
     async function getHomePageUserData() {
          try {
               let dataFetchResponse = await axiosAPI.get("/home");
               return dataFetchResponse?.data;


          } catch (axiosError) {
               console.log(axiosError);
               throw axiosError;
          }
     }

     // useEffects
     useEffect(function () {
          if (!isError) return;

          if (error?.message === "Network Error") setIsNetworkError(true);

          return () => setIsNetworkError(false)

     }, [error, isError])

     // animations and page loader functions
     function growTextArea(target) {
          target.style.height = "auto";
          target.style.height = target.scrollHeight + "px";
     }
     function scaleAddAttachmentBox() {
          let Svg = addAttachmentSvgReference.current;
          let Box = addAttachmentsBoxReference.current;

          if (Svg.classList.contains("classRotateAddSvg") && Box.classList.contains("scaleAddAttachmentBox")) {
               Svg.classList.remove("classRotateAddSvg");
               Box.classList.remove("scaleAddAttachmentBox");
          } else {
               Svg.classList.add("classRotateAddSvg");
               Box.classList.add("scaleAddAttachmentBox");
          }
     }
     function scaleContainer(targetContainerReference, classNameToBeAdded) {
          let container = targetContainerReference.current;

          if (container.classList.contains(`${classNameToBeAdded}`)) {
               container.classList.remove(`${classNameToBeAdded}`);
          } else {
               container.classList.add(`${classNameToBeAdded}`);
          }
     }

     return (
          <>
               <nav className="alignCenter chatAppHead">
                    <div className="favicon alignCenter">
                         <div className="logo">
                              <p className="appName">Quickrr</p>
                              {/* <img src="/public/logo.png" loading="lazy" alt="LOGO..." /> <-- logo here */}
                         </div>
                    </div>
                    <Tippy
                         content="Visit Profile"
                         animation="scale"
                         duration={[250, 180]}
                         className="profile-tooltip"
                         placement="left"

                    >
                         <div className="userProfile alignCenter">
                              <div className="avatar center">
                                   <img src="src\assets\avatar.webp" loading="lazy" alt="Avatar..." />
                              </div>
                              <div className="userFullName">
                                   <p>Ankit mehra</p>
                              </div>
                              <div className="isOnlineStatusGreenDot"></div>
                         </div>
                    </Tippy>
               </nav>
               <main className="flex">
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
                    <aside id="chatListContainer">
                         <div className="chatListHead alignCenter">
                              <p className="chats-text">Chats</p>
                              <div className="alignCenter">
                                   <Tippy
                                        className="profile-tooltip"
                                        content="Add Chat"
                                        animation="scale"
                                        duration={[250, 180]}
                                        placement="bottom"
                                   >
                                        <button className="center" id="addChatButton"><img src="src/assets/add-user.png" loading="lazy" alt="Error!" /></button>
                                   </Tippy>
                                   <button
                                        className="center"
                                        id="chatOptionsButton"
                                        onClick={() => scaleContainer(chatOperationsBox, "onclickScaleOptionsContainer")}
                                   >
                                        <img src="src/assets/more.png" loading="lazy" alt="Error!" />
                                   </button>
                                   <div ref={chatOperationsBox} className="flex chatOperationsBox">
                                        <ul>
                                             <li><button className="alignCenter chatOperationsButtons"><Icon icon="mdi:account-multiple-add-outline"></Icon>Create Group</button></li>
                                             <li><button className="alignCenter chatOperationsButtons"><Icon icon="mdi:checkbox-outline" className="iconifyIcons"></Icon>Select Chats</button></li>
                                             <li><button className="alignCenter chatOperationsButtons"><Icon icon="mdi:logout"></Icon>Log Out</button></li>
                                        </ul>
                                   </div>
                              </div>
                         </div>
                         <ul className="chatList">
                              {isPending ? (
                                   <>
                                        <ChatListSkeleton />
                                        <ChatListSkeleton />
                                        <ChatListSkeleton />
                                   </>
                              ) : (
                                   <>
                                        <li className="chat alignCenter">
                                             <div className="center chatUserAvatar">
                                                  <img src="src/assets/avatar.webp" loading="lazy" alt="Avatar" />
                                             </div>
                                             <div className="chatInfo alignCenter">
                                                  <div className="chatInfoRight flex">
                                                       <span className="chatUserFullname">Moksh Sachdeva</span>
                                                       <div className="alignCenter">
                                                            <img className="lastMessageIcons" src="src/assets/message-sent.png" alt="" /><span className="alignCenter chatUserLastMessage">Bhai message to padh liya kar</span>
                                                       </div>
                                                  </div>
                                                  <div className="chatInfoLeft">
                                                       <span className="lastChatDate">27/11/2025</span>
                                                  </div>
                                             </div>
                                        </li>
                                        <li className="chat alignCenter">
                                             <div className="center chatUserAvatar">
                                                  <img src="src/assets/avatar.webp" loading="lazy" alt="Avatar" />
                                             </div>
                                             <div className="chatInfo alignCenter">
                                                  <div className="chatInfoRight flex">
                                                       <span className="chatUserFullname">Kartikey</span>
                                                       <div className="alignCenter">
                                                            <img className="lastMessageIcons" src="src/assets/message-read-blue.png" alt="" />
                                                            <span className="alignCenter chatUserLastMessage">Bhai kya kar raha hai aajkal</span>
                                                       </div>
                                                  </div>
                                                  <div className="chatInfoLeft">
                                                       <span className="lastChatDate">27/11/2025</span>
                                                  </div>
                                             </div>
                                        </li>
                                        <li className="chat alignCenter">
                                             <div className="center chatUserAvatar">
                                                  <img src="src/assets/avatar.webp" loading="lazy" alt="Avatar" />
                                             </div>
                                             <div className="chatInfo alignCenter">
                                                  <div className="chatInfoRight flex">
                                                       <span className="chatUserFullname">Aryan</span>
                                                       <div className="alignCenter">
                                                            <img className="lastMessageIcons" src="src/assets/message-read-blue.png" alt="" />
                                                            <span className="alignCenter chatUserLastMessage">Meri notebook leerwerwerwer aio</span>
                                                       </div>
                                                  </div>
                                                  <div className="chatInfoLeft">
                                                       <span className="lastChatDate">12/01/2025</span>
                                                  </div>
                                             </div>
                                        </li>
                                   </>
                              )
                              }


                         </ul>
                    </aside>
                    <aside id="chatDisplayContainer">
                         <nav className="chatDisplayContainerHead alignCenter">
                              <div className="alignCenter">
                                   <div className="selectedChatAvatar center">
                                        <img src="src/assets/avatar.webp" loading="lazy" alt="Error..." />
                                   </div>
                                   <p className="selectedChatUsername">Kartikey Dost</p>
                              </div>
                              <div className="alignCenter">
                                   <button className="selectChatOperationButtons center"><Icon icon="mdi:video" style={{ color: "#f8f2f2" }}></Icon></button>
                                   <button className="selectChatOperationButtons center"><Icon icon="mdi:phone" style={{ color: "#f8f2f2" }}></Icon></button>
                                   <button className="selectChatOperationButtons center"><Icon icon="mdi:search" style={{ color: "#f8f2f2" }}></Icon></button>
                                   <button onClick={() => scaleContainer(selectedChatOptionDropDown, "onclickScaleSelectedChatOptions")} className="selectChatOperationButtons center"><Icon icon="mdi:more-vert" style={{ color: "#f8f2f2" }}></Icon></button>
                                   {createPortal(
                                        <div
                                             ref={selectedChatOptionDropDown}
                                             className="selectedChatOptionDropdown"
                                        >
                                             <ul className="flex">
                                                  <li className="alignCenter"><Icon icon="ci:info"></Icon><span>Contact info</span></li>
                                                  <li className="alignCenter"><Icon icon="fluent:select-all-on-20-regular"></Icon><span>Select messages</span></li>
                                                  <li className="alignCenter"><Icon icon="basil:notification-off-outline"></Icon><span>Mute user</span></li>
                                                  <li className="alignCenter"><Icon icon="icon-park-outline:like"></Icon><span>Add to favourites</span></li>
                                                  <li className="alignCenter"><Icon icon="fontisto:close"></Icon><span>Close chat</span></li>
                                                  <li className="alignCenter"><Icon icon="tabler:message-report"></Icon><span>Report</span></li>
                                                  <li className="alignCenter"><Icon icon="solar:user-block-bold"></Icon><span>Block user</span></li>
                                                  <li className="alignCenter"><Icon icon="bx:message-alt-minus"></Icon><span>Clear chat</span></li>
                                                  <li className="alignCenter"><Icon icon="mingcute:delete-line"></Icon><span>Delete chat</span></li>
                                             </ul>
                                        </div>,
                                        document.body
                                   )}
                              </div>
                         </nav>
                         <main className="currentChatDisplay flex">
                              {/* <p className="secondPerson">Hello</p> <-- dummy divs(to be injected by javascript)
                        <p className="firstPerson">hello...</p> */}
                              <p className="secondPerson">Hello ankit</p>
                              <p className="firstPerson">han bhai...</p>
                         </main>
                         <div className="chatInputBox alignCenter">
                              <button
                                   onClick={scaleAddAttachmentBox}
                                   className="center chatInputButton addAttachmentsButton">
                                   <Icon ref={addAttachmentSvgReference} icon="mdi:plus"></Icon>
                              </button>
                              <textarea
                                   value={message}
                                   onChange={(e) => setMessage(e.target.value)}
                                   className="alignCenter"
                                   onInput={(e) => growTextArea(e.target)}
                                   rows="1"
                                   placeholder="Type something..."
                                   id="chatInput"></textarea>
                              <button className="center chatInputButton voiceChatInput">
                                   <Icon icon="mdi:microphone-outline"></Icon>
                              </button>
                              <div
                                   ref={addAttachmentsBoxReference}
                                   className="attachmentOptionBox">
                                   <ul className="flex">
                                        <li className="alignCenter"><Icon icon="mdi:file-document-add"></Icon><span>Add Files</span></li>
                                        <li className="alignCenter">
                                             <Icon icon="mdi:images"></Icon>
                                             <span>Photos & videos</span>
                                        </li>
                                        <li className="alignCenter"><Icon icon="mdi:audio"></Icon><span>Audio file</span></li>
                                        <li className="alignCenter"><Icon icon="mdi:camera"></Icon><span>Camera</span></li>
                                        <li className="alignCenter"><Icon icon="mdi:contact"></Icon><span>Contacts</span></li>
                                   </ul>
                              </div>
                         </div>
                    </aside>
               </main>
          </>
     )
}

export default UserDashboard;
