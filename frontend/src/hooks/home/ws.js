import { notification } from "antd";
import global from "../../config/config.js";

export const useGroupWebsocket = () => {
  const [groupJoined] = useState([]); // last message, count unread message
  const [groupNotJoined] = useState([]);
  const [api, contextHolder] = notification
    .useNotification() // newuser, newmessage, deletegroup, changegroupname
    .useEffect(() => {
      // group
      const groupWebsocket = new WebSocket(`ws://${global.host}/group/ws`);
    }, []);
};
