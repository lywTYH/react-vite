import { useState, useCallback, useEffect, useRef } from 'react';
import { map} from 'lodash-es';
import './App.css';

const webSocketUrl = 'ws://127.0.0.1:8080';

interface Info {
  value: string;
  date: Date;
}
function useWebSocket(webSocketUrl: string) {
  const [status, setStatus] = useState<number>(0);
  const [historyMsg, setHistory] = useState<Array<Info>>([]);
  const wsRef = useRef<undefined | WebSocket>();

  const createSocket = useCallback(() => {
    try {
      wsRef.current = new WebSocket(webSocketUrl);
      wsRef.current.onopen = () => setStatus(wsRef.current?.readyState ?? 0);
      wsRef.current.onclose = () => setStatus(wsRef.current?.readyState ?? 0);
      wsRef.current.onerror = () => {
        setStatus(wsRef.current?.readyState ?? 0);
      };
      wsRef.current.onmessage = (e) => {
        if (e.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            console.log('Result: ' + reader.result?.toString);
            setHistory((list) => [
              ...list,
              {
                value: reader.result?.toString() || '',
                date: new Date(),
              },
            ]);
          };
          reader.readAsText(e.data);
        } else {
          setHistory((list) => [
            ...list,
            {
              value: e.data || '',
              date: new Date(),
            },
          ]);
        }
      };
    } catch (error) {
      console.log(error);
    }
  }, [webSocketUrl]);

  useEffect(() => {
    if (!wsRef.current || wsRef.current.readyState === 3) {
      createSocket();
      return;
    }
    return () => {
      if (!wsRef.current) {
        return;
      }
      wsRef.current.close();
    };
  }, [createSocket]);

  const send = useCallback((msg: string) => {
    if (!wsRef.current || wsRef.current.readyState === 3) {
      throw Error('connecting ');
    }
    wsRef.current.send(msg);
    setHistory((list) => [
      ...list,
      {
        value: msg,
        date: new Date(),
      },
    ]);
  }, []);

  return { send, historyMsg, status };
}

function MsgList({ historyMsg }: { historyMsg: Info[] }) {
  return (
    <div>
      {map(historyMsg, (item, index) => {
        return {
          ...item,
          id: index,
        };
      }).map(({ value: msg, date }) => {
        return <p key={date.toISOString()}>{msg}</p>;
      })}
    </div>
  );
}

function App() {
  const [msg, setMsg] = useState('');
  const [count, setCount] = useState(0);
  const { send, status, historyMsg } = useWebSocket(webSocketUrl);
  const handleClickSendMessage = useCallback((msg: string) => send(msg), [send]);
  console.log(historyMsg);
  return (
    <div>
      <h1>websocket </h1>
      <div>
        <h1>WebSockets Demo</h1>
        <div id="status">'status':{status}</div>
        <ul id="messages"></ul>
        <form
          id="message"
          onSubmit={(e) => {
            e.preventDefault();
            handleClickSendMessage(msg);
          }}
        >
          <input
            id="message"
            placeholder="Write your message here..."
            required
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />

          <button type="submit">Send Message</button>
          <button type="button" id="close">
            Close Connection
          </button>
        </form>
      </div>
      <MsgList historyMsg={historyMsg} />
      <h1>test </h1>
      <button
        type="button"
        onClick={() => {
          setCount(count + 1);
          setCount(count + 1);
          setCount(count + 1);
          setCount(count + 1);
        }}
      >
        {count} count
      </button>
    </div>
  );
}

export default App;
