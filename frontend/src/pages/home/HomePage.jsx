import { HomeProvider } from "../../context/home/home.jsx";
import { JoinedGroup } from "./components/JoinedGroup.jsx";
import { Messages } from "./components/Messages.jsx";
import { NotJoinedGroup } from "./components/NotJoinedGroup.js";

export default function HomePage() {
  return (
    <HomeProvider>
      <div className={"w-full flex"}>
        <JoinedGroup />
        <Messages />
        <NotJoinedGroup />
      </div>
    </HomeProvider>
  );
}
