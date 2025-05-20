import { HERMES_KEY, HERMES_URL } from "../../constants";
import { request } from "/utils/request";

Page({
  data: {
    messages: [],
    inputValue: '',
    lastMessageId: '',
    userInfo: {
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
    }
  },

  onLoad() {
    // Initialize with some dummy messages
    this.setData({
      messages: [
        {
          id: 1,
          content: 'Hello!',
          time: '10:00',
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
          isSelf: false
        },
        {
          id: 2,
          content: 'Hi there!',
          time: '10:01',
          avatar: this.data.userInfo.avatar,
          isSelf: true
        }
      ],
      lastMessageId: 'msg-2'
    });
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  sendMessage() {
    if (!this.data.inputValue.trim()) return;

    const newMessage = {
      id: this.data.messages.length + 1,
      content: this.data.inputValue,
      time: this.formatTime(new Date()),
      avatar: this.data.userInfo.avatar,
      isSelf: true
    };

    const messages = [...this.data.messages, newMessage];

    this.setData({
      messages,
      inputValue: '',
      lastMessageId: `msg-${newMessage.id}`
    });
    console.log(this.data.inputValue)
     this.fetchAdvice(newMessage.content)
  },

  receiveMessage(content) {
    const newMessage = {
      id: this.data.messages.length + 1,
      content,
      time: this.formatTime(new Date()),
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
      isSelf: false
    };

    const messages = [...this.data.messages, newMessage];

    this.setData({
      messages,
      lastMessageId: `msg-${newMessage.id}`
    });
  },

  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  loadMoreMessages() {
    // Implement loading previous messages here
    my.showToast({
      content: 'Loading more messages...'
    });
  },

  async fetchAdvice(message) {
    try {
      const data = {
        inputs: {
          ask: message
        },
        user: 'ridwanf'
      }
      const res = await request({
        url: HERMES_URL,
        method: 'POST',
        data: data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HERMES_KEY}`,
        }
      })
      this.receiveMessage(res.data.data.outputs.result);
      
    }
    catch(error) {
      console.error(error)
    }
  }

});
