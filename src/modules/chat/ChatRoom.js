import React, { useEffect, useState, useRef } from 'react'
import {over} from 'stompjs';
import SockJS from 'sockjs-client';
import { getChatHistoryOfTwoUsers, getConversations, test2 } from '../../api';
import RenderPagination from '../../components/Pagination';
import RenderPaginationSimple from '../../components/PaginationSimple';
import { Button, Input, message as m }  from 'antd';

const initialSearch = {
	message: { value: '' },
}
let stompClient =null;
const ChatRoom = () => {
    const messagesEndRef = useRef(null)

   
    const [privateChats, setPrivateChats] = useState(new Map());     
    const [publicChats, setPublicChats] = useState([]); 
    const [tab,setTab] =useState("CHATROOM");
    const [userData, setUserData] = useState({
        username: localStorage.getItem('userName') || '',
        receivername: '',
        connected: false,
        message: ''
    });

    const [count, setCount] = useState(0);

	const [page, setPage] = useState({ current: 1, pageSize: 10 })
	const [searchState, setSearchState] = useState(initialSearch)
    const {message} = searchState;

      console.log('private chat',privateChats);
    useEffect(() => {
      console.log(userData);
    }, [userData]);

    useEffect(() => {
        if (localStorage.getItem('userName')) {
            registerUser();
            fetchConversation(localStorage.getItem('userName'))
        }
    }, [])

    useEffect(() => {
        if (localStorage.getItem('userName')) {
            getPrivateChatHistory(localStorage.getItem('userName'), tab, page.current, page.pageSize)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page])

    const scrollToBottom = () => {
        console.log('scrollToBottom');
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }

    const fetchConversation = async (userName) => {
        const res = await getConversations(userName);
        console.log('res', res);
        const data = res?.data?.responseData || [];
        if(data && data?.length > 0){
            for(let i = 0; i < data.length; i++){
                const item = data[i];
                if(item.userOne !== item.userTwo && item.userOne !== userName){
                    privateChats.set(item.userOne,[]);
                }
                if(item.userOne !== item.userTwo && item.userTwo !== userName){
                    privateChats.set(item.userTwo,[]);
                }
            }
            setPrivateChats(privateChats);
        }
    }

    const getPrivateChatHistory = async (sender, receiver, pageNumber = 1, pageSize = 15) => {
        const query = `&message=${message.value || ''}`
        
        const res = await getChatHistoryOfTwoUsers(sender, receiver, pageNumber, pageSize, query);
        console.log("rrrrrrrrrrrrrrrrrrr", res)
        const conversation = res?.data?.responseData?.listObject || []
        setCount(res?.data?.responseData?.count || 0)

        if (conversation || conversation?.length > 0) {
            const reversedConversation = conversation.reverse();
            console.log("conversation", reversedConversation)
            privateChats.get(receiver).unshift(...reversedConversation)
            setPrivateChats(new Map(privateChats));
            scrollToBottom()
        }
        
        
    }

    const connect =()=>{
        let Sock = new SockJS('http://localhost:8888/ws');
        // let Sock = new SockJS('http://192.168.0.149:9998/api/websocket');

        stompClient = over(Sock);
        stompClient.connect({},onConnected, onError);
    }

    const onConnected = () => {
        setUserData({...userData, connected: true});
        stompClient.subscribe('/chatroom/public', onMessageReceived);
        stompClient.subscribe('/user/'+userData.username+'/private', onPrivateMessage);
        userJoin();
    }

    const userJoin=()=>{
          var chatMessage = {
            senderName: userData.username,
            status:"JOIN"
          };
          stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    }

    const onMessageReceived = (payload)=>{
        var payloadData = JSON.parse(payload.body);
        console.log("onMessageReceived", payloadData);
        // eslint-disable-next-line default-case
        switch(payloadData.status){
            case "JOIN":
                if(!privateChats.get(payloadData.senderName)){
                    privateChats.set(payloadData.senderName,[]);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
        }
    }
    
    const onPrivateMessage = (payload)=>{
        console.log(payload);
        var payloadData = JSON.parse(payload.body);
        console.log("onPrivateMessage", payloadData);
        m.info(payloadData.senderName + " just sent you a message");
        if(privateChats.get(payloadData.senderName)){
            console.log("privateChats 102", privateChats);
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        }else{
            let list =[];
            list.push(payloadData);
            privateChats.set(payloadData.senderName,list);
            setPrivateChats(new Map(privateChats));
        }
    }

    const onError = (err) => {
        console.log('err nha',err);
        
    }

    const handleMessage =(event)=>{
        const {value}=event.target;
        setUserData({...userData,"message": value});
    }
    const sendValue=()=>{
            if (stompClient) {
              var chatMessage = {
                senderName: userData.username,
                message: userData.message,
                status:"MESSAGE"
              };
              console.log(chatMessage);
              stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
              setUserData({...userData,"message": ""});
            }
    }

    const sendPrivateValue=()=>{
        if (stompClient) {
          var chatMessage = {
            senderName: userData.username,
            receiverName:tab,
            message: userData.message,
            status:"MESSAGE"
          };
          
          if(userData.username !== tab){
              console.log('private chat 145', privateChats)
            privateChats.get(tab).push(chatMessage);
            setPrivateChats(new Map(privateChats));
          }
          stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
          setUserData({...userData,"message": ""});
         
        }
        setTimeout(() => {
            scrollToBottom()
        },200)
    }

    const handleUsername=(event)=>{
        const {value}=event.target;
        setUserData({...userData,"username": value});
    }

    const registerUser=()=>{
        connect();
    }
    return (
    <div className="container">
        {userData.connected?
        <div className="chat-box">
            <div className="member-list">
                <ul>
                    <li onClick={()=>{setTab("CHATROOM")}} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li>
                    {[...privateChats.keys()].map((name,index)=>(
                        <li 
                            onClick={name === tab? () => {} : ()=>{
                                setTab(name)
                                setPage({current: 1, pageSize: 15})
                                console.log('onclick name tab', name, userData.username)
                                // getPrivateChatHistory(userData.username, name);
                            }} 
                            className={`member ${tab===name && "active"}`} key={index}>
                                {name}
                        </li>
                    ))}
                </ul>
            </div>
            {tab==="CHATROOM" && <div className="chat-content">
                <ul className="chat-messages">
                    
                    {publicChats.map((chat,index)=>(
                        <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                            {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                            <div className="message-data">{chat.message}</div>
                            {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                        </li>
                    ))}
                </ul>

                <div className="send-message">
                    <Input size='large' type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} /> 
                    <Button type='primary' size='large'  className="send-button" onClick={sendValue}>send</Button>
                </div>
            </div>}
            {tab!=="CHATROOM" && <div className="chat-content">
         
                <ul className="chat-messages" style={{marginTop: 16}}>
                <RenderPaginationSimple
                        count={count}
                        page={page}         
                        setPage={setPage}
				    />
                    {[...privateChats.get(tab)].map((chat,index)=> {
                        return <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                            {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                            <div className="message-data">{chat.message}</div>
                            {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                        </li>
                    })}

                    <div ref={messagesEndRef} />
                    
                </ul>

                <div className="send-message">
                    <Input size='large' type="text" className="input-message" placeholder="enter the message" value={userData.message} onChange={handleMessage} /> 
                    <Button type='primary' size='large'  className="send-button" onClick={sendPrivateValue}>send</Button>
                </div>
            </div>}
        </div>
        :
        <div className="register">
            <input
                id="user-name"
                placeholder="Enter your name"
                name="userName"
                value={userData.username}
                onChange={handleUsername}
                margin="normal"
              />
              <button type="button" onClick={registerUser}>
                    connect
              </button> 
        </div>}
    </div>
    )
}

export default ChatRoom
