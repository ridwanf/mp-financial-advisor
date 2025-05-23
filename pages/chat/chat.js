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
    },
    sessionId: ''
  },

  onLoad() {
    // Initialize with some dummy messages
    this.setData({
      messages: [
        {
          id: 1,
          content: 'Hello, I`m Da-Finci your personal advisor. How can I help',
          time: this.formatTime(new Date()),
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
          isSelf: false,
        },
      ],
      lastMessageId: 'msg-1',
    });
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  onKeyDown(e) {
    // Alipay Mini Program: e.detail.keyCode, e.detail.shiftKey
    // keyCode 13 = Enter
    if (e.detail.keyCode === 13) {
      if (e.detail.shiftKey) {
        // Shift+Enter: tambahkan baris baru
        this.setData({
          inputValue: this.data.inputValue + '\n'
        });
        // Cegah default agar tidak kirim
        return false;
      } else {
        // Enter tanpa Shift: kirim pesan
        this.sendMessage();
        // Cegah default agar tidak tambah baris baru
        return false;
      }
    }
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
    this.fetchAdvice(newMessage.content)
  },

  receiveMessage(content) {
    const hasLink = this.hasDanaLink(content)
    const newMessage = {
      id: this.data.messages.length + 1,
      content: content,
      time: this.formatTime(new Date()),
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
      isSelf: false,
      hasLink: hasLink,

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


  hasDanaLink(message) {
    return message.includes('link.dana.id');
  },

  extractJsonFromResponse(response) {
    try {
      // Find content between ```json and ``` markers
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) return null;

      // Parse the JSON string
      const jsonString = jsonMatch[1];
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  },


  splitMessage(message) {
    // Initialize default result
    const result = {
      riskProfile: '',
      productSuggestion: '',
      footer: '',
      link: null
    };

    // Extract link using regex
    const linkMatch = message.match(/\[.*?\]\((.*?)\)/);
    if (linkMatch) {
      result.link = linkMatch[1];
    }

    // Split message into sections
    const sections = message
      .replace(/\[.*?\]\(.*?\)/g, '') // Remove markdown link
      .split('\n\n')
      .filter(section => section.trim() !== '');

    if (sections.length >= 1) {
      result.riskProfile = sections[0].trim();
    }
    if (sections.length >= 2) {
      result.productSuggestion = sections[1].trim() + sections[2].trim();
    }
    if (sections.length >= 4) {
      result.footer = sections[3].trim() + sections[4].trim();
    }

    return result;
  },

  async fetchAdvice(message) {
    try {
      this.setData({ isTyping: true });

      const data = {
        inputs: {
          name: 'ridwan'
        },
        conversation_id: this.data.sessionId,
        query: message,
        response_mode: "blocking",
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
      if (response.data && response.data) {
        this.setData({ isTyping: false });
        this.setData({ sessionId: response.data.conversation_id })
        this.receiveMessage(response.data.answer);
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
