const sockets = {
  connect() {
    console.log('Socket connected with ' + process.env.SOCKET_URL);
  },
  new_message(data) {
    console.log(`New message from ${data.sender_id}: ${data.body}`);
    const message = {
      chat_id: data.chat_id,
      sender_id: data.sender_id,
      sender_first_name: data.sender_first_name,
      sender_last_name: data.sender_last_name,
      body: data.body,
      time_sent: data.time_sent,
      new: data.new
    };
    this.$store.dispatch('addMessage', { message });
  }
}

export default sockets;
