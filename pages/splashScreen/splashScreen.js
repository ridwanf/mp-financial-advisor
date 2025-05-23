Page({
  data: {},
  onLoad() {
    setTimeout(() => {
      my.redirectTo({
        url: '/pages/chat/chat'
      });
    }, 1500);
  },
});
