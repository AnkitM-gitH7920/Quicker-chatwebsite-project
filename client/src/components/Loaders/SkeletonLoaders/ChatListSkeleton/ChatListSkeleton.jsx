import "./chat-list-skeleton.css";
import "react-loading-skeleton/dist/skeleton.css";

import Skeleton from "react-loading-skeleton";

export default function ChatListSkeleton() {
     return (
          <div className="chatListItemSkeleton">
               {/* Avatar */}
               <Skeleton
                    circle
                    height={45}
                    width={45}
                    baseColor="#2a2f3b"
                    highlightColor="#3a3f4b"
               />

               {/* Text Section */}
               <div className="chatTextSkeleton">
                    <Skeleton
                         height={14}
                         width="70%"
                         baseColor="#2a2f3b"
                         highlightColor="#3a3f4b"
                    />
                    <Skeleton
                         height={12}
                         width="45%"
                         baseColor="#2a2f3b"
                         highlightColor="#3a3f4b"
                    />
               </div>

               {/* Date */}
               <Skeleton
                    height={10}
                    width={50}
                    baseColor="#2a2f3b"
                    highlightColor="#3a3f4b"
               />
          </div>
     )
}
