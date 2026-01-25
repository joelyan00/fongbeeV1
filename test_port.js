import net from 'net';
const server = net.createServer();
server.listen(5175, '127.0.0.1', () => {
    console.log('SUCCESS: Listening on 5175');
    process.exit(0);
});
server.on('error', (e) => {
    console.error('FAILURE:', e);
    process.exit(1);
});
