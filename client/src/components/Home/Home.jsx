import "../../css/App.css";
import "../../css/utilities.css";
import "../../css/Home.css";
import "tippy.js/animations/scale.css";

import Tippy from "@tippyjs/react";
import axios from "axios";
import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";

// ! Pending Tasks :-
// ? if the user name is to big then give it a ... at the end
// ? if the recent chat user name is to big then give it a ... at the end


function UserDashboard() {
    // useState(s)
    let [enteredChatMessage, setEnteredChatMessage] = useState("");

    // useRef(s)
    let chatOperationsBox = useRef(null);
    let selectedChatOptionDropDown = useRef(null);
    let addAttachmentSvgReference = useRef(null);
    let addAttachmentsBoxReference = useRef(null);

    //queries
    const {

    } = useQuery({
        queryKey: ["verifyUserSesson"],
        queryFn: async () => {
            try {
                axios.get("http://localhost:8000/v1/auth")

            } catch (sessionVerificationError) { throw sessionVerificationError }
        },
        retry: false,
        refetchOnReconnect: true,
        retryOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    })

    // animations and page loader functions
    function growTextArea(target) {
        target.style.height = "auto";
        target.style.height = target.scrollHeight + "px";
    }
    function loadProfilePage() {
        console.log("Loaded profile page")
    }
    function scaleAddAttachmentBox() {
        let Svg = addAttachmentSvgReference.current;
        let Box = addAttachmentsBoxReference.current;

        if (Svg.classList.contains("classRotateAddSvg") && Box.classList.contains("scaleAddAttachmentBox")) {
            Svg.classList.remove("classRotateAddSvg");
            Box.classList.remove("scaleAddAttachmentBox");
        } else {
            Svg.classList.add("classRotateAddSvg");
            Box.classList.add("scaleAddAttachmentBox")
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
                        <p className="appName">Chat App</p>
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
                    <div onClick={loadProfilePage} className="userProfile alignCenter">
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
                        <li className="chat alignCenter">
                            <div className="center chatUserAvatar">
                                <img src="src/assets/avatar.webp" loading="lazy" alt="Avatar" />
                            </div>
                            <div className="chatInfo alignCenter">
                                <div className="chatInfoRight flex">
                                    <span className="chatUserFullname">Moksh Sachdeva</span>
                                    {/* last message icons for :- sticker, deleted message, photos */}
                                    {/* for groups:- show the name of the user who sent the last message */}
                                    <div className="alignCenter">
                                        <img className="lastMessageIcons" src="src/assets/message-sent.png" alt="" /><span className="alignCenter chatUserLastMessage">Bhai message to padh liya kar</span>
                                    </div>
                                </div>
                                <div className="chatInfoLeft">
                                    <span className="lastChatDate">27/11/2025</span> {/*Format :- DD/MM/YYYY */}
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
                                    {/* last message icons for :- sticker, deleted message, photos */}
                                    {/* for groups:- show the name of the user who sent the last message */}
                                    <div className="alignCenter">
                                        <img className="lastMessageIcons" src="src/assets/message-read-blue.png" alt="" />
                                        <span className="alignCenter chatUserLastMessage">Bhai kya kar raha hai aajkal</span>
                                    </div>
                                </div>
                                <div className="chatInfoLeft">
                                    <span className="lastChatDate">27/11/2025</span> {/*Format :- DD/MM/YYYY */}
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
                                    {/* last message icons for :- sticker, deleted message, photos */}
                                    {/* for groups:- show the name of the user who sent the last message */}
                                    <div className="alignCenter">
                                        <img className="lastMessageIcons" src="src/assets/message-read-blue.png" alt="" />
                                        <span className="alignCenter chatUserLastMessage">Meri notebook leerwerwerwer aio</span>
                                    </div>
                                </div>
                                <div className="chatInfoLeft">
                                    <span className="lastChatDate">12/01/2025</span> {/*Format :- DD/MM/YYYY */}
                                </div>
                            </div>
                        </li>
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
                            onChange={(e) => setEnteredChatMessage(e.target.value)}
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
