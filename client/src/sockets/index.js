const sockets = {
  connect() {
    console.log('Socket connected with ' + process.env.SOCKET_URL);
  }
}

export default sockets;
