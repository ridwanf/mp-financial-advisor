import { HERMES_KEY, HERMES_URL, HERMES_USER } from "../../constants";
import { request } from "/utils/request";

Page({
  data: {
    messages: [],
    inputValue: '',
    lastMessageId: '',
    isTyping: false,
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
          content: 'Halo nama saya Finor, saya akan membantu anda',
          time: this.formatTime(new Date()),
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
          isSelf: false
        },
      ],
      lastMessageId: 'msg-1'
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

  async fetchAdvice(message) {
    try {
      this.setData({ isTyping: true });

      const data = {
        inputs: {
          ask: message
        },
        user: HERMES_USER
      };

      const response = await request({
        url: HERMES_URL,
        method: 'POST',
        data: data,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HERMES_KEY}`,
        }
      })
      if (response.data && response.data.data.outputs) {
        this.setData({ isTyping: false });
        console.log(response.data.data.outputs)
        this.receiveMessage(response.data.data.outputs.result);
      }
    } catch (error) {
      this.setData({ isTyping: false });
      console.error('Error:', error);
      my.showToast({
        type: 'fail',
        content: 'Failed to get response'
      });
    }
  }

});
