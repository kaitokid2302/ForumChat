import { HomeProvider } from "../../context/home/Home.jsx";
import { JoinedGroup } from "./components/JoinedGroup.jsx";
import { Messages } from "./components/Messages.jsx";
import { NotJoinedGroup } from "./components/NotJoinedGroup.jsx";

export default function HomePage() {
  return (
    <HomeProvider>
      <div className="w-full h-full flex">
        <JoinedGroup />
        <Messages />
        <NotJoinedGroup />
      </div>
    </HomeProvider>
  );
}
